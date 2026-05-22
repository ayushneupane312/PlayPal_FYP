const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  getAvailableSlots,
  createBooking,
  initiatePayment,
  verifyPayment,
  confirmCashPayment,
  getMyBookings,
  getBookingById,
  cancelBooking,
  cancelBookingByLeader,
  getVenueBookings,
  approveBooking,
  rejectBooking,
  getOwnerEarnings,
  initiateSplitPayment,
  verifySplitPayment,
  payShare,
  getMyPendingSplitPayments
} = require('../controllers/BookingController');

// ═══════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════

// Get available time slots for a venue/court
router.get('/available-slots', getAvailableSlots);

// ═══════════════════════════════════════════════════════════
// PLAYER ROUTES (Protected)
// ═══════════════════════════════════════════════════════════

// Create new booking (works for both Khalti and Cash)
router.post('/', verifyToken, createBooking);

// Initiate Khalti payment (only for khalti bookings)
router.post('/payment/initiate', verifyToken, initiatePayment);

// Verify Khalti payment
router.post('/payment/verify', verifyToken, verifyPayment);

// Get user's bookings
router.get('/my-bookings', verifyToken, getMyBookings);

// Pending split shares for logged-in user
router.get('/pending-split-payments', verifyToken, getMyPendingSplitPayments);

// ═══════════════════════════════════════════════════════════
// FUTSAL OWNER ROUTES (must be before /:id so /owner/bookings is not matched as :id)
// ═══════════════════════════════════════════════════════════

router.get('/owner/bookings', verifyToken, getVenueBookings);
router.patch('/owner/:id/approve', verifyToken, approveBooking);
router.patch('/owner/:id/reject', verifyToken, rejectBooking);
router.post('/owner/confirm-cash-payment', verifyToken, confirmCashPayment);
router.get('/owner/earnings', verifyToken, getOwnerEarnings);

// Split payment – verify (no :id) must come before /:id routes
router.post('/verify-split-payment', verifyToken, verifySplitPayment);

// Booking by id (these must come after /owner/... routes)
router.post('/:id/initiate-split-payment', verifyToken, initiateSplitPayment);
router.post('/:id/pay-share', verifyToken, payShare);
router.patch('/:id/cancel-by-leader', verifyToken, cancelBookingByLeader);
router.get('/:id', verifyToken, getBookingById);
router.patch('/:id/cancel', verifyToken, cancelBooking);

module.exports = router;