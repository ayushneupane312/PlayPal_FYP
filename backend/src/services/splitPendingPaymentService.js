const User = require('../models/UserModel');
const Booking = require('../models/BookingModel');

function toIdStr(id) {
  if (!id) return '';
  return id._id ? id._id.toString() : id.toString();
}

function formatBookingDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function buildPendingEntry(booking, splitEntry) {
  const venue = booking.venue;
  return {
    bookingId: booking._id,
    courtName: booking.court?.name || 'Court',
    venueName: typeof venue === 'object' ? venue?.venueName || '' : '',
    bookingDate: booking.bookingDate,
    startTime: booking.timeSlot?.startTime || '',
    endTime: booking.timeSlot?.endTime || '',
    amountDue: splitEntry.amountAssigned,
    deadline: booking.paymentDeadline,
    paymentStatus: splitEntry.paymentStatus || 'pending',
    paymentMethod: booking.payment?.method || 'khalti'
  };
}

/**
 * Upsert pendingPayments on each split player from a booking document.
 */
async function syncPendingPaymentsFromBooking(booking) {
  if (!booking || booking.paymentType !== 'split' || !Array.isArray(booking.splitPlayers)) {
    return;
  }

  const bookingId = booking._id;
  const playerIds = booking.splitPlayers.map((sp) => toIdStr(sp.userId));

  await User.updateMany(
    { 'pendingPayments.bookingId': bookingId },
    { $pull: { pendingPayments: { bookingId } } }
  );

  if (booking.bookingStatus !== 'pending') {
    return;
  }

  for (const sp of booking.splitPlayers) {
    const uid = toIdStr(sp.userId);
    if (!uid) continue;

    if (sp.paymentStatus === 'pending') {
      const entry = buildPendingEntry(booking, sp);
      await User.findByIdAndUpdate(uid, {
        $push: { pendingPayments: entry }
      });
    }
  }

  const staleIds = await User.find({
    'pendingPayments.bookingId': bookingId,
    _id: { $nin: playerIds }
  }).distinct('_id');

  if (staleIds.length) {
    await User.updateMany(
      { _id: { $in: staleIds } },
      { $pull: { pendingPayments: { bookingId } } }
    );
  }
}

async function clearPendingPaymentsForBooking(bookingId) {
  const id = bookingId?._id || bookingId;
  if (!id) return;
  await User.updateMany(
    { 'pendingPayments.bookingId': id },
    { $pull: { pendingPayments: { bookingId: id } } }
  );
}

async function refreshPendingPaymentsAfterBookingSave(bookingId) {
  const booking = await Booking.findById(bookingId)
    .populate('venue', 'venueName')
    .lean();
  if (!booking) return;
  await syncPendingPaymentsFromBooking(booking);
}

/**
 * List pending split shares for the logged-in user (source of truth: Booking).
 */
async function getPendingSplitPaymentsForUser(userId) {
  const uid = toIdStr(userId);
  const now = new Date();

  const bookings = await Booking.find({
    paymentType: 'split',
    bookingStatus: 'pending',
    paymentDeadline: { $gt: now },
    splitPlayers: {
      $elemMatch: {
        userId: uid,
        paymentStatus: 'pending'
      }
    }
  })
    .populate('venue', 'venueName')
    .sort({ paymentDeadline: 1 })
    .lean();

  return bookings.map((b) => {
    const share = b.splitPlayers.find((sp) => toIdStr(sp.userId) === uid);
    return {
      bookingId: b._id,
      courtName: b.court?.name || 'Court',
      venueName: b.venue?.venueName || '',
      date: b.bookingDate,
      dateLabel: formatBookingDate(b.bookingDate),
      startTime: b.timeSlot?.startTime,
      endTime: b.timeSlot?.endTime,
      amountDue: share?.amountAssigned ?? 0,
      deadline: b.paymentDeadline,
      paymentStatus: 'pending',
      paymentMethod: b.payment?.method || 'khalti',
      totalAmount: b.pricing?.totalAmount,
      paidCount: b.splitPlayers.filter((p) => p.paymentStatus === 'paid').length,
      totalPlayers: b.splitPlayers.length
    };
  });
}

function splitPaymentLink(bookingId) {
  return `/player/booking/split/${bookingId}`;
}

module.exports = {
  syncPendingPaymentsFromBooking,
  clearPendingPaymentsForBooking,
  refreshPendingPaymentsAfterBookingSave,
  getPendingSplitPaymentsForUser,
  splitPaymentLink,
  buildPendingEntry
};
