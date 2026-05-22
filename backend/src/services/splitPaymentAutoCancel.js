const Booking = require('../models/BookingModel');
const Team = require('../models/TeamModel');
const Match = require('../models/MatchModel');
const { notifyUser } = require('./notificationService');
const { removePendingPaymentsForBooking } = require('./pendingPaymentService');

const INTERVAL_MS = 60 * 1000; // every 1 minute

/**
 * Find split bookings past payment deadline and cancel them; release team.
 */
async function runAutoCancel() {
  try {
    const now = new Date();
    const expired = await Booking.find({
      paymentType: 'split',
      bookingStatus: 'pending',
      paymentDeadline: { $lt: now },
    });

    for (const booking of expired) {
      booking.bookingStatus = 'cancelled';
      booking.cancellation = {
        isCancelled: true,
        cancelledBy: 'user',
        cancelledAt: now,
        cancellationReason: 'Split payment incomplete within 30 minutes',
        refundEligible: false,
      };
      await booking.save();

      await removePendingPaymentsForBooking(booking._id);

      if (booking.teamRef) {
        await Team.findByIdAndUpdate(booking.teamRef, {
          $unset: { bookingRef: 1 },
          status: 'ready',
        });
      }
      await Match.findOneAndUpdate({ bookingRef: booking._id }, { $unset: { bookingRef: 1 } });

      const courtName = booking.court?.name || 'the court';
      if (Array.isArray(booking.splitPlayers)) {
        for (const entry of booking.splitPlayers) {
          const memberId = entry.userId?.toString?.();
          if (!memberId) continue;
          await notifyUser(memberId, {
            title: 'Split booking expired',
            message: `Split payment for ${courtName} was not completed in time. The booking was cancelled.`,
            type: 'booking_cancelled',
            link: '/player/bookings',
            meta: { bookingId: booking._id },
          });
        }
      }
    }

    if (expired.length > 0) {
      console.log(`[SplitPayment] Auto-cancelled ${expired.length} expired split booking(s)`);
    }
  } catch (err) {
    console.error('[SplitPayment] Auto-cancel error:', err);
  }
}

function startAutoCancelJob() {
  runAutoCancel();
  setInterval(runAutoCancel, INTERVAL_MS);
}

module.exports = { startAutoCancelJob, runAutoCancel };
