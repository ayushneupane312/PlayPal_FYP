const User = require('../models/UserModel');
const Booking = require('../models/BookingModel');

function memberIdFromEntry(entry) {
  const id = entry?.userId;
  if (!id) return null;
  return id._id ? id._id.toString() : id.toString();
}

function buildPendingEntry(booking, splitEntry) {
  const userId = memberIdFromEntry(splitEntry);
  if (!userId) return null;

  return {
    bookingId: booking._id,
    courtName: booking.court?.name || 'Court',
    venueName: booking.venue?.venueName || '',
    date: booking.bookingDate,
    startTime: booking.timeSlot?.startTime || '',
    endTime: booking.timeSlot?.endTime || '',
    amountDue: splitEntry.amountAssigned,
    deadline: booking.paymentDeadline,
    paymentStatus: splitEntry.paymentStatus === 'paid' ? 'paid' : 'pending',
  };
}

/**
 * Upsert pending payment rows on each split member's profile (pending shares only).
 */
async function syncPendingPaymentsFromBooking(booking) {
  if (!booking || booking.paymentType !== 'split' || !Array.isArray(booking.splitPlayers)) {
    return;
  }

  const bookingId = booking._id.toString();

  for (const splitEntry of booking.splitPlayers) {
    const userId = memberIdFromEntry(splitEntry);
    if (!userId) continue;

    const user = await User.findById(userId);
    if (!user) continue;

    const entry = buildPendingEntry(booking, splitEntry);
    if (!entry) continue;

    const idx = (user.pendingPayments || []).findIndex(
      (p) => p.bookingId && p.bookingId.toString() === bookingId
    );

    if (splitEntry.paymentStatus === 'paid') {
      if (idx >= 0) {
        user.pendingPayments.splice(idx, 1);
        await user.save();
      }
      continue;
    }

    if (booking.bookingStatus !== 'pending') {
      if (idx >= 0) {
        user.pendingPayments.splice(idx, 1);
        await user.save();
      }
      continue;
    }

    if (idx >= 0) {
      user.pendingPayments[idx] = entry;
    } else {
      if (!user.pendingPayments) user.pendingPayments = [];
      user.pendingPayments.push(entry);
    }
    await user.save();
  }
}

/**
 * Remove pending payment entries for all users tied to a booking.
 */
async function removePendingPaymentsForBooking(bookingId) {
  const id = bookingId?.toString?.() || String(bookingId);
  await User.updateMany(
    { 'pendingPayments.bookingId': id },
    { $pull: { pendingPayments: { bookingId: id } } }
  );
}

/**
 * Mark one member's share as paid on their profile (removes pending row).
 */
async function markUserSharePaid(userId, bookingId) {
  const uid = userId?.toString?.() || String(userId);
  const bid = bookingId?.toString?.() || String(bookingId);
  await User.updateOne(
    { _id: uid },
    { $pull: { pendingPayments: { bookingId: bid } } }
  );
}

/**
 * List pending split payments for a user (from profile + live booking sync).
 */
async function getPendingPaymentsForUser(userId) {
  const uid = userId?.toString?.() || String(userId);

  const bookings = await Booking.find({
    paymentType: 'split',
    bookingStatus: 'pending',
    splitPlayers: {
      $elemMatch: {
        userId: uid,
        paymentStatus: 'pending',
      },
    },
    paymentDeadline: { $gt: new Date() },
  })
    .populate('venue', 'venueName')
    .sort({ paymentDeadline: 1 });

  for (const b of bookings) {
    await syncPendingPaymentsFromBooking(b);
  }

  const user = await User.findById(uid).select('pendingPayments');
  const now = new Date();
  const list = (user?.pendingPayments || []).filter(
    (p) => p.paymentStatus === 'pending' && (!p.deadline || new Date(p.deadline) > now)
  );

  return list;
}

/**
 * Drop stale/invalid pending payment rows so user.save() does not fail validation.
 */
function sanitizeUserPendingPayments(user) {
  if (!user || !Array.isArray(user.pendingPayments)) return;
  const now = new Date();
  user.pendingPayments = user.pendingPayments.filter((p) => {
    if (!p || p.paymentStatus !== 'pending') return false;
    if (p.deadline && new Date(p.deadline) <= now) return false;
    return true;
  });
}

module.exports = {
  syncPendingPaymentsFromBooking,
  removePendingPaymentsForBooking,
  markUserSharePaid,
  getPendingPaymentsForUser,
  buildPendingEntry,
  sanitizeUserPendingPayments,
};
