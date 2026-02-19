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
  payShare
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

// Split payment – verify (no :id) must come before /:id routes
router.post('/verify-split-payment', verifyToken, verifySplitPayment);

// Split payment by booking id
router.post('/:id/initiate-split-payment', verifyToken, initiateSplitPayment);
router.post('/:id/pay-share', verifyToken, payShare);
router.patch('/:id/cancel-by-leader', verifyToken, cancelBookingByLeader);

// Get specific booking
router.get('/:id', verifyToken, getBookingById);

// Cancel booking
router.patch('/:id/cancel', verifyToken, cancelBooking);

// ═══════════════════════════════════════════════════════════
// FUTSAL OWNER ROUTES (Protected)
// ═══════════════════════════════════════════════════════════

// Get all bookings for owner's venue
router.get('/owner/bookings', verifyToken, getVenueBookings);

// Approve booking
router.patch('/owner/:id/approve', verifyToken, approveBooking);

// Reject booking
router.patch('/owner/:id/reject', verifyToken, rejectBooking);

// Confirm cash payment (owner confirms player paid in cash)
router.post('/owner/confirm-cash-payment', verifyToken, confirmCashPayment);

// Get earnings/revenue
router.get('/owner/earnings', verifyToken, getOwnerEarnings);

module.exports = router;