const mongoose = require('mongoose');
const Booking = require('../models/BookingModel');
const Venue = require('../models/VenueModel');
const User = require('../models/UserModel');
const Team = require('../models/TeamModel');
const Match = require('../models/MatchModel');
const khaltiService = require('../services/khaltiService');
const { notifyUser } = require('../services/notificationService');

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

function generateTimeSlots(startTime, endTime, intervalHours = 1) {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const start = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    
    currentHour += intervalHours;
    if (currentMin + (intervalHours % 1) * 60 >= 60) {
      currentHour += 1;
      currentMin = (currentMin + (intervalHours % 1) * 60) % 60;
    }

    const end = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

    if (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      slots.push({ startTime: start, endTime: end });
    }
  }

  return slots;
}

// ═══════════════════════════════════════════════════════════
// PLAYER BOOKING ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * Get available time slots for a venue on a specific date
 */
// In BookingController.js - Update getAvailableSlots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { venueId, courtId, date } = req.query;

    if (!venueId || !courtId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Venue ID, Court ID, and date are required'
      });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    const court = venue.courts.id(courtId);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Get bookings for this court on this date
    const bookingDate = new Date(date);
    const existingBookings = await Booking.find({
      venue: venueId,
      'court.courtId': courtId,
      bookingDate: bookingDate,
      bookingStatus: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot bookingStatus user playerInfo').populate('user', 'name');

    // Get operating hours
    const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'long' });
    const operatingHours = venue.operatingHours.find(oh => oh.day === dayName);

    if (!operatingHours || !operatingHours.isOpen) {
      return res.status(200).json({
        success: true,
        message: 'Venue is closed on this day',
        data: {
          availableSlots: [],
          bookedSlots: []
        }
      });
    }

    // Generate all possible time slots
    const allSlots = generateTimeSlots(
      operatingHours.openTime,
      operatingHours.closeTime,
      1
    );

    // Separate booked and available slots
    const bookedSlotTimes = existingBookings.map(b => b.timeSlot.startTime);
    const availableSlots = allSlots.filter(slot => !bookedSlotTimes.includes(slot.startTime));
    const bookedSlots = allSlots.filter(slot => bookedSlotTimes.includes(slot.startTime));

    // Add pricing to available slots
    const isWeekend = [0, 6].includes(bookingDate.getDay());
    const slotsWithPricing = availableSlots.map(slot => {
      const isPeakHour = operatingHours.peakHours && 
        slot.startTime >= operatingHours.peakHours.start &&
        slot.startTime < operatingHours.peakHours.end;

      let price;
      if (isPeakHour && court.pricing.peakHourRate) {
        price = court.pricing.peakHourRate;
      } else if (!isPeakHour && court.pricing.offPeakRate) {
        price = court.pricing.offPeakRate;
      } else {
        price = isWeekend ? court.pricing.weekendRate : court.pricing.weekdayRate;
      }

      return {
        ...slot,
        price,
        isPeakHour,
        isWeekend,
        status: 'available'
      };
    });

    // Add info to booked slots
    const bookedSlotsWithInfo = bookedSlots.map(slot => {
      const booking = existingBookings.find(b => b.timeSlot.startTime === slot.startTime);
      return {
        ...slot,
        status: 'booked',
        bookingStatus: booking?.bookingStatus,
        bookedBy: booking?.playerInfo?.name || booking?.user?.name || 'Someone'
      };
    });

    res.status(200).json({
      success: true,
      data: {
        venue: {
          id: venue._id,
          name: venue.venueName
        },
        court: {
          id: court._id,
          name: court.name,
          surfaceType: court.surfaceType
        },
        date: bookingDate,
        dayName,
        operatingHours: {
          openTime: operatingHours.openTime,
          closeTime: operatingHours.closeTime
        },
        availableSlots: slotsWithPricing,
        bookedSlots: bookedSlotsWithInfo,
        totalSlots: allSlots.length,
        availableCount: slotsWithPricing.length,
        bookedCount: bookedSlotsWithInfo.length
      }
    });
  } catch (error) {
    console.error('❌ Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots',
      error: error.message
    });
  }
};

/**
 * Create a new booking
 */
exports.createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      venueId,
      courtId,
      bookingDate,
      startTime,
      endTime,
      duration,
      numberOfPlayers,
      specialRequests,
      paymentMethod = 'cash', // 'khalti' | 'esewa' | 'cash'
      cashSplitAmongPlayers // boolean: split court fee equally at venue after game (cash only)
    } = req.body;

    if (paymentMethod === 'esewa') {
      return res.status(400).json({
        success: false,
        message: 'eSewa is disabled in this project. Use Khalti or Cash.'
      });
    }

    // Validate required fields
    if (!venueId || !courtId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking details'
      });
    }

    // Check if slot is still available
    const isAvailable = await Booking.isSlotAvailable(
      venueId,
      courtId,
      new Date(bookingDate),
      startTime
    );

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available'
      });
    }

    // Get venue and court details
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    const court = venue.courts.id(courtId);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Get user details
    const user = await User.findById(userId);

    // Calculate pricing
    const date = new Date(bookingDate);
    const isWeekend = [0, 6].includes(date.getDay());
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const operatingHours = venue.operatingHours.find(oh => oh.day === dayName);

    const isPeakHour = operatingHours?.peakHours &&
      startTime >= operatingHours.peakHours.start &&
      startTime < operatingHours.peakHours.end;

    let basePrice;
    if (isPeakHour && court.pricing.peakHourRate) {
      basePrice = court.pricing.peakHourRate;
    } else if (!isPeakHour && court.pricing.offPeakRate) {
      basePrice = court.pricing.offPeakRate;
    } else {
      basePrice = isWeekend ? court.pricing.weekendRate : court.pricing.weekdayRate;
    }

    const totalAmount = basePrice * (duration || 1);

    if (!Number.isFinite(basePrice) || basePrice < 0) {
      return res.status(400).json({
        success: false,
        message:
          'Court pricing is missing or invalid for this slot. The venue owner must set weekday/weekend (and optional peak/off-peak) rates.'
      });
    }
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not calculate a valid price for this booking. Try another time or contact the venue.'
      });
    }

    const splitCount = Math.min(20, Math.max(1, parseInt(numberOfPlayers, 10) || 10));
    const wantsCashSplit =
      paymentMethod === 'cash' &&
      (cashSplitAmongPlayers === true || cashSplitAmongPlayers === 'true');
    let venueCashSplit;
    if (paymentMethod === 'cash') {
      if (wantsCashSplit) {
        const sharePerPlayer = Math.round((totalAmount / splitCount) * 100) / 100;
        venueCashSplit = {
          enabled: true,
          splittingPlayerCount: splitCount,
          sharePerPlayer,
          courtFeeTotal: totalAmount
        };
      } else {
        venueCashSplit = { enabled: false };
      }
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      venue: venueId,
      court: {
        courtId: court._id,
        name: court.name,
        surfaceType: court.surfaceType
      },
      bookingDate: date,
      timeSlot: {
        startTime,
        endTime
      },
      duration: duration || 1,
      pricing: {
        basePrice,
        discount: 0,
        totalAmount
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cash' ? 'pending' : 'pending'
      },
      bookingStatus: 'pending',
      playerInfo: {
        name: user.name,
        phone: user.phone || '',
        email: user.email,
        numberOfPlayers: splitCount
      },
      specialRequests: specialRequests || '',
      ...(venueCashSplit ? { venueCashSplit } : {})
    });

    await booking.populate('venue', 'venueName fullAddress contactInfo');

    try {
      await notifyUser(venue.owner, {
        role: 'futsalowner',
        title: 'New booking request',
        message: `${user.name} requested ${court.name} on ${bookingDate} at ${startTime}.${wantsCashSplit ? ' Group may split the court fee equally at the venue after the game.' : ''}`,
        type: 'booking_created',
        link: '/futsalowner/booking-management',
        meta: { bookingId: booking._id.toString() }
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    console.log('✅ Booking created:', booking._id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('❌ Create booking error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has just been booked by someone else'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

/**
 * Initiate Khalti payment for a booking (KPG-2 Web Checkout)
 */
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.userId;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    }).populate('venue', 'venueName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or does not belong to you'
      });
    }

    if (booking.payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }

    if (booking.payment.method !== 'khalti') {
      return res.status(400).json({
        success: false,
        message: 'This booking is set for cash payment. Cannot initiate online payment.'
      });
    }

    const user = await User.findById(userId);
    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

    // Prepare payment data according to Khalti KPG-2 specification
    const totalAmount = booking.pricing.totalAmount;
    const amountInPaisa = khaltiService.convertToPaisa(totalAmount);

    const paymentData = {
      amount: amountInPaisa,
      purchaseOrderId: booking._id.toString(),
      purchaseOrderName: `${booking.venue.venueName} - ${booking.court.name}`,
      customerInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone || '9800000000'
      },
      // bookingId in query helps the SPA verify; sessionStorage is also set on redirect as a fallback
      returnUrl: `${frontendBase}/player/booking/payment-callback?bookingId=${booking._id}`,
      websiteUrl: frontendBase,
      amountBreakdown: [
        {
          label: 'Court Booking Fee',
          amount: amountInPaisa
        }
      ],
      productDetails: [
        {
          identity: booking._id.toString(),
          name: `${booking.venue.venueName} - ${booking.court.name}`,
          total_price: amountInPaisa,
          quantity: 1,
          unit_price: amountInPaisa
        }
      ]
    };

    const paymentResponse = await khaltiService.initiatePayment(paymentData);

    // Update booking with pidx and payment expiry
    booking.payment.khaltiPidx = paymentResponse.pidx;
    booking.payment.paymentExpiresAt = paymentResponse.expiresAt;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        pidx: paymentResponse.pidx,
        paymentUrl: paymentResponse.paymentUrl,
        expiresAt: paymentResponse.expiresAt,
        expiresIn: paymentResponse.expiresIn,
        bookingId: booking._id
      }
    });
  } catch (error) {
    console.error('❌ Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment',
      error: error.error,
      error_key: error.error_key
    });
  }
};

/**
 * Verify Khalti payment using Lookup API (KPG-2)
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { pidx, bookingId } = req.body;
    const userId = req.userId;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: 'Payment index (pidx) is required'
      });
    }

    // Verify payment with Khalti Lookup API
    const verification = await khaltiService.verifyPayment(pidx);

    console.log('📋 Payment Verification Status:', verification.status);

    // Handle different payment statuses
    if (verification.pending) {
      return res.status(200).json({
        success: false,
        message: 'Payment is still pending. Please wait or contact support.',
        status: 'pending',
        data: verification
      });
    }

    if (verification.failed) {
      return res.status(400).json({
        success: false,
        message: `Payment ${verification.status.toLowerCase()}. Please try again.`,
        status: verification.status,
        data: verification
      });
    }

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        status: verification.status,
        data: verification
      });
    }

    // Find and update booking
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      'payment.khaltiPidx': pidx
    }).populate('venue', 'venueName fullAddress contactInfo');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or does not belong to you'
      });
    }

    // Check if already processed
    if (booking.payment.status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: { booking, payment: verification }
      });
    }

    // Update payment status
    booking.payment.status = 'paid';
    booking.payment.transactionId = verification.transactionId;
    booking.payment.paidAt = new Date();
    booking.payment.khaltiTransactionId = verification.transactionId;
    booking.payment.khaltiFee = verification.fee;
    booking.bookingStatus = 'confirmed';
    booking.notifications.userNotified = false;
    booking.notifications.ownerNotified = false;

    await booking.save();

    // Update venue stats
    await Venue.findByIdAndUpdate(booking.venue, {
      $inc: { 'stats.totalBookings': 1 }
    });

    console.log('✅ Booking confirmed:', booking._id);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Your booking is confirmed!',
      data: {
        booking,
        payment: {
          status: verification.status,
          transactionId: verification.transactionId,
          amount: khaltiService.convertToRupees(verification.amount),
          fee: khaltiService.convertToRupees(verification.fee),
          refunded: verification.refunded
        }
      }
    });
  } catch (error) {
    console.error('❌ Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed',
      error: error.error
    });
  }
};

// ═══════════════════════════════════════════════════════════
// SPLIT PAYMENT (after matchmaking)
// ═══════════════════════════════════════════════════════════

/**
 * Initiate Khalti payment for current user's split share
 */
exports.initiateSplitPayment = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const userId = req.userId;

    const booking = await Booking.findById(bookingId)
      .populate('venue', 'venueName')
      .populate('splitPlayers.userId', 'name email phone');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.paymentType !== 'split') {
      return res.status(400).json({ success: false, message: 'Not a split payment booking' });
    }
    if (booking.payment?.method !== 'khalti') {
      return res.status(400).json({
        success: false,
        message: 'Online Khalti split is only for Khalti bookings. Use cash share for cash splits.'
      });
    }
    if (booking.bookingStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is no longer pending' });
    }
    if (booking.paymentDeadline && new Date() > booking.paymentDeadline) {
      return res.status(400).json({ success: false, message: 'Payment deadline has passed' });
    }

    const playerEntry = booking.splitPlayers.find(
      p => (p.userId && p.userId._id ? p.userId._id.toString() : p.userId.toString()) === userId
    );
    if (!playerEntry) {
      return res.status(403).json({ success: false, message: 'You are not assigned to pay for this booking' });
    }
    if (playerEntry.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Your share is already paid' });
    }

    const amountInPaisa = khaltiService.convertToPaisa(playerEntry.amountAssigned);
    if (amountInPaisa < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Amount too small for Khalti (min Rs 10). Pay at venue or contact leader.'
      });
    }

    const user = await User.findById(userId);
    const purchaseOrderId = `split:${bookingId}:${userId}`;
    const paymentData = {
      amount: amountInPaisa,
      purchaseOrderId,
      purchaseOrderName: `Split: ${booking.venue.venueName} - Your share Rs ${playerEntry.amountAssigned}`,
      customerInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone || '9800000000'
      },
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/player/booking/split-payment-callback`,
      websiteUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      productDetails: [
        {
          identity: purchaseOrderId,
          name: `Split share - ${booking.venue.venueName}`,
          total_price: amountInPaisa,
          quantity: 1,
          unit_price: amountInPaisa
        }
      ]
    };

    const paymentResponse = await khaltiService.initiatePayment(paymentData);

    res.status(200).json({
      success: true,
      message: 'Payment initiated for your share',
      data: {
        pidx: paymentResponse.pidx,
        paymentUrl: paymentResponse.paymentUrl,
        expiresAt: paymentResponse.expiresAt,
        bookingId: booking._id,
        amount: playerEntry.amountAssigned
      }
    });
  } catch (error) {
    console.error('Initiate split payment error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to initiate split payment'
    });
  }
};

/**
 * Verify Khalti split payment and mark that player's share as paid
 */
exports.verifySplitPayment = async (req, res) => {
  try {
    const { pidx } = req.body;
    const userId = req.userId;

    if (!pidx) {
      return res.status(400).json({ success: false, message: 'pidx is required' });
    }

    const verification = await khaltiService.verifyPayment(pidx);
    if (verification.pending) {
      return res.status(200).json({ success: false, message: 'Payment still pending', status: 'pending' });
    }
    if (verification.failed || !verification.verified) {
      return res.status(400).json({ success: false, message: 'Payment failed or not verified' });
    }

    const purchaseOrderId = verification.data?.purchase_order_id || verification.purchase_order_id;
    if (!purchaseOrderId || !purchaseOrderId.startsWith('split:')) {
      return res.status(400).json({ success: false, message: 'Invalid split payment reference' });
    }
    const [, bookingId, payUserId] = purchaseOrderId.split(':');
    if (payUserId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.paymentType !== 'split' || booking.bookingStatus !== 'pending') {
      return res.status(404).json({ success: false, message: 'Booking not found or not pending' });
    }

    const playerIndex = booking.splitPlayers.findIndex(
      p => (p.userId && p.userId.toString()) === userId
    );
    if (playerIndex === -1) {
      return res.status(403).json({ success: false, message: 'You are not in this split booking' });
    }
    if (booking.splitPlayers[playerIndex].paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Share already marked paid',
        data: { booking }
      });
    }

    booking.splitPlayers[playerIndex].paymentStatus = 'paid';
    booking.splitPlayers[playerIndex].paidAt = new Date();
    booking.splitPlayers[playerIndex].transactionId = verification.transactionId || verification.data?.transaction_id;

    const allPaid = booking.splitPlayers.every(p => p.paymentStatus === 'paid');
    if (allPaid) {
      booking.bookingStatus = 'confirmed';
      booking.payment.status = 'paid';
      booking.payment.paidAt = new Date();
      booking.payment.transactionId = `split:${booking.splitPlayers.map(p => p.transactionId).filter(Boolean).join(',')}`;
    }
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('venue', 'venueName fullAddress contactInfo')
      .populate('splitPlayers.userId', 'name email');
    return res.status(200).json({
      success: true,
      message: allPaid ? 'All shares paid. Booking confirmed!' : 'Your share has been recorded.',
      data: { booking: populated, allPaid }
    });
  } catch (error) {
    console.error('Verify split payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Verification failed'
    });
  }
};

/**
 * Mark own share as paid (e.g. cash at venue). Only the assigned player can call.
 */
exports.payShare = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const userId = req.userId;
    const { transactionId: customTxId } = req.body || {};

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.paymentType !== 'split') {
      return res.status(400).json({ success: false, message: 'Not a split payment booking' });
    }
    if (booking.bookingStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is no longer pending' });
    }
    if (booking.paymentDeadline && new Date() > booking.paymentDeadline) {
      return res.status(400).json({ success: false, message: 'Payment deadline has passed' });
    }

    const playerIndex = booking.splitPlayers.findIndex(
      p => (p.userId && p.userId.toString()) === userId
    );
    if (playerIndex === -1) {
      return res.status(403).json({ success: false, message: 'You are not assigned to pay for this booking' });
    }
    if (booking.splitPlayers[playerIndex].paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Your share is already paid' });
    }

    booking.splitPlayers[playerIndex].paymentStatus = 'paid';
    booking.splitPlayers[playerIndex].paidAt = new Date();
    booking.splitPlayers[playerIndex].transactionId = customTxId || `cash-${Date.now()}`;

    const allPaid = booking.splitPlayers.every(p => p.paymentStatus === 'paid');
    if (allPaid) {
      booking.bookingStatus = 'confirmed';
      booking.payment.status = 'paid';
      booking.payment.paidAt = new Date();
    }
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('venue', 'venueName fullAddress contactInfo')
      .populate('splitPlayers.userId', 'name email');
    return res.status(200).json({
      success: true,
      message: allPaid ? 'All shares paid. Booking confirmed!' : 'Your share has been recorded.',
      data: { booking: populated, allPaid }
    });
  } catch (error) {
    console.error('Pay share error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record payment'
    });
  }
};

/**
 * Cancel a split (or full) booking - leader only
 */
exports.cancelBookingByLeader = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const userId = req.userId;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const leaderId = (booking.leaderId || booking.user).toString();
    if (leaderId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the team leader can cancel this booking' });
    }
    if (!['pending', 'confirmed'].includes(booking.bookingStatus)) {
      return res.status(400).json({ success: false, message: 'Booking cannot be cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellation = {
      isCancelled: true,
      cancelledBy: 'user',
      cancelledAt: new Date(),
      cancellationReason: 'Cancelled by leader',
      refundEligible: false
    };
    await booking.save();

    if (booking.teamRef) {
      await Team.findByIdAndUpdate(booking.teamRef, { $unset: { bookingRef: 1 }, status: 'ready' });
    }
    // If this booking was linked to a match, clear the match bookingRef so leaders can rebook
    await Match.findOneAndUpdate({ bookingRef: bookingId }, { $unset: { bookingRef: 1 } });

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled',
      data: { booking }
    });
  } catch (error) {
    console.error('Cancel booking by leader error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel'
    });
  }
};

/**
 * Mark cash payment as paid (Owner confirms payment)
 */
exports.confirmCashPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.userId;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the owner
    const venue = await Venue.findOne({ _id: booking.venue, owner: userId });
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not the owner of this venue'
      });
    }

    if (booking.payment.method !== 'cash') {
      return res.status(400).json({
        success: false,
        message: 'This booking is not set for cash payment'
      });
    }

    booking.payment.status = 'paid';
    booking.payment.paidAt = new Date();
    booking.bookingStatus = 'confirmed';

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Cash payment confirmed successfully',
      data: booking
    });
  } catch (error) {
    console.error('❌ Confirm cash payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm cash payment',
      error: error.message
    });
  }
};

/**
 * Get user's bookings (including split bookings where user is leader or in splitPlayers)
 */
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { user: userId },
        { leaderId: userId },
        { 'splitPlayers.userId': userId }
      ]
    };
    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('venue', 'venueName fullAddress contactInfo media')
      .sort({ bookingDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

/**
 * Get booking by ID (allowed if user is booker, leader, or in splitPlayers)
 */
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // First, find the booking by ID
    const booking = await Booking.findById(id)
      .populate('venue', 'venueName fullAddress contactInfo media operatingHours')
      .populate('splitPlayers.userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const userIdStr = userId?.toString();
    let isAuthorized = false;

    // 1) Direct ownership: booker, leader, or split-player
    if (
      (booking.user && booking.user.toString() === userIdStr) ||
      (booking.leaderId && booking.leaderId.toString() === userIdStr) ||
      (booking.splitPlayers || []).some(
        (p) => p.userId && p.userId._id
          ? p.userId._id.toString() === userIdStr
          : p.userId.toString() === userIdStr
      )
    ) {
      isAuthorized = true;
    }

    // 2) Member of the booked team (for team bookings)
    if (!isAuthorized && booking.teamRef) {
      const team = await Team.findById(booking.teamRef).select('leader players.user');
      if (team) {
        const leaderStr = team.leader?.toString();
        const inPlayers = (team.players || []).some(
          (p) => p.user && p.user.toString() === userIdStr
        );
        if (leaderStr === userIdStr || inPlayers) {
          isAuthorized = true;
        }
      }
    }

    // 3) Member of opponent team in a Match linked to this booking
    if (!isAuthorized) {
      const match = await Match.findOne({ bookingRef: booking._id }).select('teamA teamB');
      if (match) {
        const teams = await Team.find({
          _id: { $in: [match.teamA, match.teamB] }
        }).select('leader players.user');

        for (const team of teams) {
          const leaderStr = team.leader?.toString();
          const inPlayers = (team.players || []).some(
            (p) => p.user && p.user.toString() === userIdStr
          );
          if (leaderStr === userIdStr || inPlayers) {
            isAuthorized = true;
            break;
          }
        }
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('❌ Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

/**
 * Cancel booking
 */
 
// backend/controllers/BookingController.js

exports.cancelBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { reason } = req.body;

    console.log('📝 Cancel booking request:', { id, userId, reason });

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      });
    }

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log('📦 Found booking:', booking._id);

    // Check if user owns this booking
    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled (Less than 2 hours before booking time)'
      });
    }

    console.log('✅ Validation passed, updating booking...');

    // Update booking status
    booking.bookingStatus = 'cancelled';
    
    // ✅ FIX: Match the actual schema structure
    booking.cancellation = {
      isCancelled: true,
      cancelledBy: 'user',  // ✅ String: 'user', 'owner', or 'admin'
      cancelledAt: new Date(),
      cancellationReason: reason.trim(),  // ✅ Note: "cancellationReason" not "reason"
      refundEligible: booking.payment.status === 'paid'
    };

    // Calculate refund if payment was made
    if (booking.payment.status === 'paid') {
      const refundAmount = booking.calculateRefund();
      booking.payment.refundAmount = refundAmount;
      booking.payment.refundedAt = new Date();
      booking.payment.status = 'refunded';
      console.log('💰 Refund calculated:', refundAmount);
    }

    await booking.save();
    console.log('✅ Booking cancelled successfully');

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('❌ Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};
// ═══════════════════════════════════════════════════════════
// FUTSAL OWNER ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * Get venue bookings (for owner)
 */
exports.getVenueBookings = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, date, page = 1, limit = 20 } = req.query;

    const venue = await Venue.findOne({ owner: userId });
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'No venue found for this owner'
      });
    }

    const query = { venue: venue._id };

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    if (date) {
      const bookingDate = new Date(date);
      query.bookingDate = {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone profileImage')
      .sort({ bookingDate: 1, 'timeSlot.startTime': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    const stats = {
      total: await Booking.countDocuments({ venue: venue._id }),
      pending: await Booking.countDocuments({ venue: venue._id, bookingStatus: 'pending' }),
      confirmed: await Booking.countDocuments({ venue: venue._id, bookingStatus: 'confirmed' }),
      completed: await Booking.countDocuments({ venue: venue._id, bookingStatus: 'completed' }),
      cancelled: await Booking.countDocuments({ venue: venue._id, bookingStatus: 'cancelled' })
    };

    res.status(200).json({
      success: true,
      data: bookings,
      stats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get venue bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

/**
 * Approve booking
 */
exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const venue = await Venue.findOne({ owner: userId });
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      venue: venue._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.ownerApproval.status = 'approved';
    booking.ownerApproval.approvedAt = new Date();
    booking.bookingStatus = 'confirmed';
    booking.notifications.ownerNotified = true;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking approved successfully',
      data: booking
    });
  } catch (error) {
    console.error('❌ Approve booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve booking',
      error: error.message
    });
  }
};

/**
 * Reject booking
 */
exports.rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { reason } = req.body;

    const venue = await Venue.findOne({ owner: userId });
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      venue: venue._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.ownerApproval.status = 'rejected';
    booking.ownerApproval.rejectedAt = new Date();
    booking.ownerApproval.rejectionReason = reason || 'Rejected by owner';
    booking.bookingStatus = 'rejected';

    // Refund if payment was made
    if (booking.payment.status === 'paid') {
      booking.payment.status = 'refunded';
      booking.payment.refundAmount = booking.pricing.totalAmount;
      booking.payment.refundedAt = new Date();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking rejected successfully',
      data: booking
    });
  } catch (error) {
    console.error('❌ Reject booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject booking',
      error: error.message
    });
  }
};

/**
 * Get owner earnings/revenue
 */
exports.getOwnerEarnings = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    const venue = await Venue.findOne({ owner: userId });
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    const query = {
      venue: venue._id,
      'payment.status': 'paid'
    };

    if (startDate && endDate) {
      query.bookingDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query);

    const totalEarnings = bookings.reduce((sum, booking) => {
      return sum + booking.pricing.totalAmount;
    }, 0);

    const monthlyEarnings = {};
    bookings.forEach(booking => {
      const month = booking.bookingDate.toISOString().slice(0, 7);
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + booking.pricing.totalAmount;
    });

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        totalBookings: bookings.length,
        monthlyEarnings,
        bookings
      }
    });
  } catch (error) {
    console.error('❌ Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error.message
    });
  }
};