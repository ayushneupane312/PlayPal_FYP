const FinancialTransaction = require('../models/FinancialTransactionModel');
const CommissionConfig = require('../models/CommissionConfigModel');
const Venue = require('../models/VenueModel');
const Booking = require('../models/BookingModel');

const DEFAULT_RATE = Math.min(
  1,
  Math.max(0, Number.parseFloat(String(process.env.PLATFORM_COMMISSION_RATE || '').trim()) || 0.1)
);

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

/**
 * Resolve commission rate: per-owner config (latest), else global (owner null), else env default.
 */
async function getEffectiveCommissionRate(ownerUserId) {
  if (ownerUserId) {
    const perOwner = await CommissionConfig.findOne({ owner: ownerUserId })
      .sort({ effective_from: -1 })
      .lean();
    if (perOwner && typeof perOwner.rate === 'number') return perOwner.rate;
  }
  const globalCfg = await CommissionConfig.findOne({ owner: null })
    .sort({ effective_from: -1 })
    .lean();
  if (globalCfg && typeof globalCfg.rate === 'number') return globalCfg.rate;
  return DEFAULT_RATE;
}

/**
 * Idempotent: one ledger row per paid booking.
 */
async function recordBookingFinancialTransaction(bookingDoc) {
  if (!bookingDoc?._id || bookingDoc.payment?.status !== 'paid') return null;

  const existing = await FinancialTransaction.findOne({ booking: bookingDoc._id });
  if (existing) return existing;

  const venue = await Venue.findById(bookingDoc.venue).select('owner').lean();
  if (!venue?.owner) return null;

  const ownerId = venue.owner;
  const rate = await getEffectiveCommissionRate(ownerId);
  const gross = roundMoney(bookingDoc.pricing?.totalAmount ?? 0);
  if (gross <= 0) return null;

  const commission_amount = roundMoney(gross * rate);
  const owner_earning = roundMoney(gross - commission_amount);

  return FinancialTransaction.create({
    payer: bookingDoc.user,
    owner: ownerId,
    venue: bookingDoc.venue,
    booking: bookingDoc._id,
    transaction_type: 'court_booking',
    gross_amount: gross,
    commission_rate: rate,
    commission_amount,
    owner_earning,
    payment_method: bookingDoc.payment?.method || 'khalti',
    payment_status: 'paid',
    payout_status: 'pending',
    reference_id: bookingDoc.payment?.transactionId || '',
  });
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Owner-facing earnings summary (design doc §4 / §7).
 */
async function getOwnerEarningsSummary(ownerUserId, { startDate, endDate } = {}) {
  const venue = await Venue.findOne({ owner: ownerUserId }).select('_id').lean();
  if (!venue) {
    return { venue: null };
  }

  const venueId = venue._id;
  const rate = await getEffectiveCommissionRate(ownerUserId);

  const txQuery = { venue: venueId };
  if (startDate && endDate) {
    txQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const ledger = await FinancialTransaction.find(txQuery).sort({ createdAt: -1 }).lean();

  const bookingQuery = {
    venue: venueId,
    'payment.status': 'paid',
  };
  if (startDate && endDate) {
    bookingQuery.bookingDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const paidBookings = await Booking.find(bookingQuery).lean();
  const totalBookings = paidBookings.length;

  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  const todaysPaidBookingsCount = await Booking.countDocuments({
    venue: venueId,
    'payment.status': 'paid',
    bookingDate: { $gte: todayStart, $lte: now },
  });

  if (ledger.length > 0) {
    let grossTotal = 0;
    let commissionTotal = 0;
    let ownerNetTotal = 0;
    const monthlyOwnerNet = {};

    for (const t of ledger) {
      grossTotal += t.gross_amount;
      commissionTotal += t.commission_amount;
      ownerNetTotal += t.owner_earning;
      const key = new Date(t.createdAt).toISOString().slice(0, 7);
      monthlyOwnerNet[key] = (monthlyOwnerNet[key] || 0) + t.owner_earning;
    }

    const monthKey = now.toISOString().slice(0, 7);

    const todayNet = ledger
      .filter((t) => new Date(t.createdAt) >= todayStart)
      .reduce((s, t) => s + t.owner_earning, 0);

    return {
      venue: venueId,
      source: 'ledger',
      commissionRateApplied: rate,
      grossTotal: roundMoney(grossTotal),
      commissionTotal: roundMoney(commissionTotal),
      ownerNetTotal: roundMoney(ownerNetTotal),
      totalBookings,
      todaysPaidBookingsCount,
      todayOwnerNet: roundMoney(todayNet),
      monthOwnerNet: roundMoney(monthlyOwnerNet[monthKey] || 0),
      monthlyOwnerNet,
      recentTransactions: ledger.slice(0, 25),
      bookings: paidBookings,
    };
  }

  // Legacy: paid bookings before ledger existed — transparent estimate
  let grossLegacy = 0;
  for (const b of paidBookings) {
    grossLegacy += Number(b.pricing?.totalAmount) || 0;
  }
  grossLegacy = roundMoney(grossLegacy);
  const commissionLegacy = roundMoney(grossLegacy * rate);
  const ownerNetLegacy = roundMoney(grossLegacy - commissionLegacy);

  const monthlyEarnings = {};
  for (const b of paidBookings) {
    const month = new Date(b.bookingDate).toISOString().slice(0, 7);
    const g = Number(b.pricing?.totalAmount) || 0;
    const net = roundMoney(g - roundMoney(g * rate));
    monthlyEarnings[month] = roundMoney((monthlyEarnings[month] || 0) + net);
  }

  const monthKey = now.toISOString().slice(0, 7);
  const todayGross = paidBookings
    .filter((b) => new Date(b.bookingDate) >= todayStart)
    .reduce((s, b) => s + (Number(b.pricing?.totalAmount) || 0), 0);

  return {
    venue: venueId,
    source: 'legacy_estimate',
    commissionRateApplied: rate,
    grossTotal: grossLegacy,
    commissionTotal: commissionLegacy,
    ownerNetTotal: ownerNetLegacy,
    totalBookings,
    todaysPaidBookingsCount,
    todayOwnerNet: roundMoney(todayGross - roundMoney(todayGross * rate)),
    monthOwnerNet: monthlyEarnings[monthKey] || 0,
    monthlyEarnings,
    monthlyOwnerNet: monthlyEarnings,
    recentTransactions: [],
    bookings: paidBookings,
  };
}

module.exports = {
  DEFAULT_RATE,
  getEffectiveCommissionRate,
  recordBookingFinancialTransaction,
  getOwnerEarningsSummary,
};
