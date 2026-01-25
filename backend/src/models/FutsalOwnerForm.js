const mongoose = require('mongoose');

const futsalOwnerSchema = new mongoose.Schema({
  // Owner Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  // Futsal Business Info
  futsalName: {
    type: String,
    required: [true, 'Futsal name is required'],
    trim: true,
    minlength: [3, 'Futsal name must be at least 3 characters long']
  },
  futsalLocation: {
    type: String,
    required: [true, 'Futsal location is required'],
    trim: true
  },
  googleMapLink: {
    type: String,
    trim: true,
    default: ''
  },
  businessContact: {
    type: String,
    required: [true, 'Business contact is required'],
    trim: true
  },
  
  // Documents (stored as file paths)
  businessDoc: {
    type: String,
    required: [true, 'Business registration document is required']
  },
  citizenshipDoc: {
    type: String,
    required: [true, 'Citizenship/ID document is required']
  },
  
  // Futsal Images (array of file paths)
  groundImages: [{
    type: String
  }],
  
  // Registration Status
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  
  // ✅ NEW: Track when status was last updated
  statusUpdatedAt: {
    type: Date
  },
  
  // ✅ NEW: Track who updated the status (optional - for future use)
  statusUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // ✅ NEW: Rejection/Approval notes (optional - for admin to add notes)
  adminNotes: {
    type: String,
    trim: true
  },
  
  // Timestamps
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// ✅ Indexes for faster queries
futsalOwnerSchema.index({ email: 1 });
futsalOwnerSchema.index({ status: 1 });
futsalOwnerSchema.index({ createdAt: -1 }); // For sorting by newest first
futsalOwnerSchema.index({ futsalName: 'text', futsalLocation: 'text', fullName: 'text' }); // For search

// ✅ Virtual property: Calculate days since registration
futsalOwnerSchema.virtual('daysSinceRegistration').get(function() {
  if (!this.createdAt) return 0;
  const now = new Date();
  const registered = new Date(this.createdAt);
  const diffTime = Math.abs(now - registered);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// ✅ Virtual property: Calculate days since last status update
futsalOwnerSchema.virtual('daysSinceStatusUpdate').get(function() {
  if (!this.statusUpdatedAt) return null;
  const now = new Date();
  const updated = new Date(this.statusUpdatedAt);
  const diffTime = Math.abs(now - updated);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// ✅ Instance method: Check if registration is pending too long
futsalOwnerSchema.methods.isPendingTooLong = function() {
  if (this.status !== 'pending') return false;
  const daysSince = this.daysSinceRegistration;
  return daysSince > 7; // Consider pending too long if more than 7 days
};

// ✅ Instance method: Get status color for UI
futsalOwnerSchema.methods.getStatusColor = function() {
  const colors = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red'
  };
  return colors[this.status] || 'gray';
};

// ✅ Static method: Get statistics
futsalOwnerSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        totalCount: [
          {
            $count: 'total'
          }
        ],
        recentRegistrations: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 }
        ],
        oldPendingRegistrations: [
          {
            $match: {
              status: 'pending',
              createdAt: {
                $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Older than 7 days
              }
            }
          },
          { $sort: { createdAt: 1 } },
          { $limit: 10 }
        ]
      }
    }
  ]);

  const result = stats[0];
  const counts = {
    total: result.totalCount[0]?.total || 0,
    pending: 0,
    approved: 0,
    rejected: 0
  };

  result.statusCounts.forEach(item => {
    counts[item._id] = item.count;
  });

  return {
    counts,
    recentRegistrations: result.recentRegistrations,
    oldPendingRegistrations: result.oldPendingRegistrations
  };
};

// ✅ Pre-save middleware: Update statusUpdatedAt when status changes
futsalOwnerSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusUpdatedAt = new Date();
  }
  next();
});

// ✅ Post-save middleware: Log status changes
futsalOwnerSchema.post('save', function(doc) {
  if (this.wasNew) {
    console.log(` New futsal owner registered: ${doc.futsalName} (${doc.email})`);
  } else if (this.isModified('status')) {
    console.log(` Status updated for ${doc.futsalName}: ${doc.status}`);
  }
});

// ✅ Enable virtuals in JSON
futsalOwnerSchema.set('toJSON', { virtuals: true });
futsalOwnerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FutsalOwner', futsalOwnerSchema);