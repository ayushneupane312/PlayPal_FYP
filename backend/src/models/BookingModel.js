const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // User who made the booking
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Venue and court details
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },

  court: {
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: String,
    surfaceType: String
  },

  // Booking date and time
  bookingDate: {
    type: Date,
    required: true
  },

  timeSlot: {
    startTime: {
      type: String,
      required: true  // "18:00"
    },
    endTime: {
      type: String,
      required: true  // "19:00"
    }
  },

  duration: {
    type: Number,
    required: true,  // in hours (e.g., 1, 1.5, 2)
    min: 0.5,
    max: 8
  },

  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },

  // Payment details
  payment: {
    method: {
      type: String,
      enum: ['khalti', 'esewa', 'cash', 'card', 'bank_transfer'],
      default: 'khalti'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    khaltiPidx: String,  // Khalti payment index
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },

  // Split payment (only after matchmaking; paymentType = 'split')
  paymentType: {
    type: String,
    enum: ['full', 'split'],
    default: 'full'
  },
  leaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  teamRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  paymentDeadline: {
    type: Date
  },
  splitPlayers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amountAssigned: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt: Date,
    transactionId: String
  }],

  // Booking status
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },

  // Owner approval
  ownerApproval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedAt: Date,
    rejectedAt: Date,
    rejectionReason: String
  },

  // Player details
  playerInfo: {
    name: String,
    phone: String,
    email: String,
    numberOfPlayers: {
      type: Number,
      min: 1,
      max: 20
    }
  },

  // Special requests
  specialRequests: {
    type: String,
    maxlength: 500
  },

  // Cancellation
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'owner', 'admin']
    },
    cancelledAt: Date,
    cancellationReason: String,
    refundEligible: {
      type: Boolean,
      default: false
    }
  },

  // Notifications
  notifications: {
    userNotified: {
      type: Boolean,
      default: false
    },
    ownerNotified: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ user: 1, bookingDate: -1 });
bookingSchema.index({ venue: 1, bookingDate: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ bookingDate: 1, 'timeSlot.startTime': 1 });

// Compound index to prevent double booking
bookingSchema.index(
  { 
    venue: 1, 
    'court.courtId': 1, 
    bookingDate: 1, 
    'timeSlot.startTime': 1 
  },
  { 
    unique: true,
    partialFilterExpression: { 
      bookingStatus: { $in: ['pending', 'confirmed'] } 
    }
  }
);

// Virtual for checking if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  return this.bookingDate > new Date() && 
         ['pending', 'confirmed'].includes(this.bookingStatus);
});

// Virtual for checking if booking is past
bookingSchema.virtual('isPast').get(function() {
  return this.bookingDate < new Date();
});

// Instance method: Check if cancellation is allowed
// backend/models/BookingModel.js

// Instance method to check if booking can be cancelled
bookingSchema.methods.canCancel = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  
  // Parse start time and add to booking date
  const [hours, minutes] = this.timeSlot.startTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
  
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  
  // Allow cancellation if booking is more than 2 hours away
  return hoursUntilBooking > 2 && ['pending', 'confirmed'].includes(this.bookingStatus);
};

// Instance method to calculate refund amount based on cancellation time
bookingSchema.methods.calculateRefund = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  
  // Parse start time
  const [hours, minutes] = this.timeSlot.startTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
  
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  

  
  if (hoursUntilBooking > 48) {
    return this.pricing.totalAmount; // 100% refund
  } else if (hoursUntilBooking > 24) {
    return Math.round(this.pricing.totalAmount * 0.5); // 50% refund
  } else if (hoursUntilBooking > 2) {
    return Math.round(this.pricing.totalAmount * 0.25); // 25% refund
  } else {
    return 0; // No refund
  }
};

// Static method: Check slot availability
bookingSchema.statics.isSlotAvailable = async function(venueId, courtId, date, startTime) {
  const existingBooking = await this.findOne({
    venue: venueId,
    'court.courtId': courtId,
    bookingDate: date,
    'timeSlot.startTime': startTime,
    bookingStatus: { $in: ['pending', 'confirmed'] }
  });
  
  return !existingBooking;
};

// Static method: Get venue bookings for a date
bookingSchema.statics.getVenueBookingsForDate = async function(venueId, date) {
  return this.find({
    venue: venueId,
    bookingDate: date,
    bookingStatus: { $in: ['pending', 'confirmed'] }
  }).populate('user', 'name email phone');
};

bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
