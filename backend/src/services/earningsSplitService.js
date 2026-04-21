const FinancialTransaction = require('../models/FinancialTransactionModel');
// const CommissionConfig = require('../models/CommissionConfigModel');
// DEPRECATED — replaced by fixed 50/50 split (owner vs platform / super admin).
// CommissionConfig model kept in repo for possible future use; not read here.
const Venue = require('../models/VenueModel');
const Booking = require('../models/BookingModel');

/** Futsal owner share of each paid booking (gross). */
const OWNER_REVENUE_SHARE = 0.5;
/** Platform / super admin share (stored as commission_rate / commission_amount). */
const PLATFORM_REVENUE_SHARE = 0.5;

/** @deprecated Use PLATFORM_REVENUE_SHARE; kept for module consumers. */
const DEFAULT_RATE = PLATFORM_REVENUE_SHARE;

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

/**
 * Fixed 50/50 revenue split. Parameter kept for API stability.
 */
async function getEffectiveCommissionRate(_ownerUserId) {
  return PLATFORM_REVENUE_SHARE;
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
  const gross = roundMoney(bookingDoc.pricing?.totalAmount ?? 0);
  if (gross <= 0) return null;

  const owner_earning = roundMoney(gross * OWNER_REVENUE_SHARE);
  const commission_amount = roundMoney(gross - owner_earning);

  return FinancialTransaction.create({
    payer: bookingDoc.user,
    owner: ownerId,
    venue: bookingDoc.venue,
    booking: bookingDoc._id,
    transaction_type: 'court_booking',
    gross_amount: gross,
    commission_rate: PLATFORM_REVENUE_SHARE,
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

function countActiveCourts(venuesLean) {
  let n = 0;
  for (const v of venuesLean || []) {
    for (const c of v.courts || []) {
      if (c && c.isActive !== false) n += 1;
    }
  }
  return n;
}

/**
 * Owner-facing earnings summary across all venues owned by this user.
 */
async function getOwnerEarningsSummary(ownerUserId, { startDate, endDate } = {}) {
  const venues = await Venue.find({ owner: ownerUserId }).select('_id courts').lean();
  if (!venues.length) {
    return { venueIds: [], hasVenues: false };
  }

  const venueIds = venues.map((v) => v._id);
  const activeCourtsCount = countActiveCourts(venues);

  const txQuery = { venue: { $in: venueIds } };
  if (startDate && endDate) {
    txQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const ledger = await FinancialTransaction.find(txQuery).sort({ createdAt: -1 }).lean();

  const bookingQuery = {
    venue: { $in: venueIds },
    'payment.status': 'paid',
  };
  if (startDate && endDate) {
    bookingQuery.bookingDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const totalBookings = await Booking.countDocuments(bookingQuery);
  const paidBookings = await Booking.find(bookingQuery)
    .sort({ bookingDate: -1, createdAt: -1 })
    .limit(40)
    .populate('venue', 'venueName')
    .populate('user', 'name')
    .lean();

  const now = new Date();
  const todayStart = startOfDay(now);

  const todaysPaidBookingsCount = await Booking.countDocuments({
    venue: { $in: venueIds },
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

    const effectiveRateDisplay =
      grossTotal > 0 ? roundMoney(commissionTotal / grossTotal) : PLATFORM_REVENUE_SHARE;

    return {
      venueIds,
      hasVenues: true,
      venue: venueIds[0],
      source: 'ledger',
      commissionRateApplied: effectiveRateDisplay,
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
      activeCourtsCount,
      venueCount: venueIds.length,
    };
  }

  const legacyGrossAgg = await Booking.aggregate([
    { $match: bookingQuery },
    {
      $group: {
        _id: null,
        sumGross: { $sum: { $ifNull: ['$pricing.totalAmount', 0] } },
      },
    },
  ]);
  const legacyMonthlyAgg = await Booking.aggregate([
    { $match: bookingQuery },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$bookingDate' } },
        monthGross: { $sum: { $ifNull: ['$pricing.totalAmount', 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const rate = PLATFORM_REVENUE_SHARE;
  const grossLegacy = roundMoney(legacyGrossAgg[0]?.sumGross || 0);
  const commissionLegacy = roundMoney(grossLegacy * rate);
  const ownerNetLegacy = roundMoney(grossLegacy - commissionLegacy);

  const monthlyEarnings = {};
  for (const row of legacyMonthlyAgg) {
    const key = row._id;
    const mg = roundMoney(row.monthGross || 0);
    const net = roundMoney(mg - roundMoney(mg * rate));
    monthlyEarnings[key] = net;
  }

  const monthKey = now.toISOString().slice(0, 7);
  const todayMatchParts = [
    { venue: { $in: venueIds } },
    { 'payment.status': 'paid' },
    { bookingDate: { $gte: todayStart, $lte: now } },
  ];
  if (startDate && endDate) {
    todayMatchParts.push({
      bookingDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
  }
  const todayGrossAgg = await Booking.aggregate([
    { $match: { $and: todayMatchParts } },
    {
      $group: {
        _id: null,
        sumGross: { $sum: { $ifNull: ['$pricing.totalAmount', 0] } },
      },
    },
  ]);
  const todayGross = roundMoney(todayGrossAgg[0]?.sumGross || 0);

  return {
    venueIds,
    hasVenues: true,
    venue: venueIds[0],
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
    activeCourtsCount,
    venueCount: venueIds.length,
  };
}

/**
 * Super admin: aggregate platform share from ledger (commission_amount).
 */
async function getPlatformEarningsSummary() {
  const match = { transaction_type: 'court_booking' };

  const [totals] = await FinancialTransaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        grossTotal: { $sum: '$gross_amount' },
        platformTotal: { $sum: '$commission_amount' },
        ownerPoolTotal: { $sum: '$owner_earning' },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  const topVenues = await FinancialTransaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$venue',
        platformShare: { $sum: '$commission_amount' },
        grossAtVenue: { $sum: '$gross_amount' },
        bookingCount: { $sum: 1 },
      },
    },
    { $sort: { platformShare: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'venues',
        localField: '_id',
        foreignField: '_id',
        as: 'venueDoc',
      },
    },
    { $unwind: { path: '$venueDoc', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        venueId: '$_id',
        name: { $ifNull: ['$venueDoc.venueName', 'Unknown venue'] },
        platformShare: 1,
        grossAtVenue: 1,
        bookingCount: 1,
      },
    },
  ]);

  const monthlyPlatform = await FinancialTransaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        platformShare: { $sum: '$commission_amount' },
        bookingCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        month: '$_id',
        platformShare: 1,
        bookingCount: 1,
        _id: 0,
      },
    },
  ]);

  const peakHours = await Booking.aggregate([
    { $match: { 'payment.status': 'paid', bookingDate: { $exists: true } } },
    {
      $project: {
        hour: { $hour: '$bookingDate' },
      },
    },
    { $group: { _id: '$hour', bookings: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return {
    grossTotal: roundMoney(totals?.grossTotal || 0),
    platformTotal: roundMoney(totals?.platformTotal || 0),
    ownerPoolTotal: roundMoney(totals?.ownerPoolTotal || 0),
    transactionCount: totals?.transactionCount || 0,
    topVenues,
    monthlyPlatform,
    peakHours: peakHours.map((h) => ({ hour: h._id, bookings: h.bookings })),
  };
}

module.exports = {
  DEFAULT_RATE,
  OWNER_REVENUE_SHARE,
  PLATFORM_REVENUE_SHARE,
  getEffectiveCommissionRate,
  recordBookingFinancialTransaction,
  getOwnerEarningsSummary,
  getPlatformEarningsSummary,
};
