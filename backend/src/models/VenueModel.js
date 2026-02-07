const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  surfaceType: {
    type: String,
    enum: ['Artificial Turf', 'Natural Grass', 'Indoor Court', 'Concrete'],
    default: 'Artificial Turf'
  },
  dimensions: {
    type: String,  // e.g., "40m x 20m"
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Pricing
  pricing: {
    weekdayRate: {
      type: Number,
      required: true,
      min: 0
    },
    weekendRate: {
      type: Number,
      required: true,
      min: 0
    },
    peakHourRate: {
      type: Number,
      min: 0
    },
    offPeakRate: {
      type: Number,
      min: 0
    }
  }
});

const operatingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  openTime: {
    type: String,  // "06:00"
    required: true
  },
  closeTime: {
    type: String,  // "22:00"
    required: true
  },
  peakHours: {
    start: String,  // "18:00"
    end: String     // "21:00"
  }
});

const venueSchema = new mongoose.Schema({
  // Owner reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Basic Information
  venueName: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Nepal' }
  },
  fullAddress: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  // Contact
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    whatsapp: String,
    website: String
  },

  // Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      index: '2dsphere'
    }
  },
  googleMapLink: String,

  // Courts
  courts: [courtSchema],

  // Operating Hours
  operatingHours: [operatingHoursSchema],

  // Facilities & Amenities
  facilities: [{
    type: String,
    enum: [
      'Parking',
      'Changing Rooms',
      'Showers',
      'Lockers',
      'Equipment Rental',
      'Cafeteria',
      'First Aid',
      'WiFi',
      'Seating Area',
      'Lighting',
      'CCTV',
      'Restrooms',
      'Drinking Water',
      'Pro Shop'
    ]
  }],

    // ✅ ADD THIS NEW FIELD
  paymentMethods: {
    cash: {
      type: Boolean,
      default: true
    },
    esewa: {
      type: Boolean,
      default: false
    },
    khalti: {
      type: Boolean,
      default: false
    },
    bankTransfer: {
      type: Boolean,
      default: false
    },
    card: {
      type: Boolean,
      default: false
    }
  },

  // Media - Cloudinary URLs
  media: {
    images: [{
      url: String,
      publicId: String,
      category: {
        type: String,
        enum: ['court', 'facility', 'exterior', 'general'],
        default: 'general'
      }
    }],
    videos: [{
      url: String,
      publicId: String,
      thumbnail: String,
      duration: Number
    }]
  },

  // Policies
  policies: {
    cancellationPolicy: {
      type: String,
      default: 'Free cancellation up to 24 hours before booking'
    },
    paymentTerms: {
      type: String,
      default: 'Payment required at time of booking'
    },
    rulesAndRegulations: {
      type: String
    },
    advanceBookingDays: {
      type: Number,
      default: 30  // How many days in advance bookings can be made
    }
  },

  // Social Media
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    website: String
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // Stats
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
venueSchema.index({ owner: 1 });
venueSchema.index({ 'location.coordinates': '2dsphere' });
venueSchema.index({ venueName: 'text', description: 'text', fullAddress: 'text' });

// Virtual for total courts
venueSchema.virtual('totalCourts').get(function() {
  return this.courts ? this.courts.filter(c => c.isActive).length : 0;
});

// Instance method: Get operating hours for a specific day
venueSchema.methods.getOperatingHoursForDay = function(dayName) {
  return this.operatingHours.find(oh => oh.day === dayName);
};

// Instance method: Check if venue is open at specific time
venueSchema.methods.isOpenAt = function(dayName, time) {
  const hours = this.getOperatingHoursForDay(dayName);
  if (!hours || !hours.isOpen) return false;
  return time >= hours.openTime && time <= hours.closeTime;
};

// Static method: Find venues near location
venueSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance  // in meters
      }
    },
    isActive: true
  });
};

venueSchema.set('toJSON', { virtuals: true });
venueSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Venue', venueSchema);