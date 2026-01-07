const mongoose = require('mongoose');

const futsalOwnerSchema = new mongoose.Schema({
  // Owner Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
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
    trim: true
  },
  futsalLocation: {
    type: String,
    required: [true, 'Futsal location is required'],
    trim: true
  },
  googleMapLink: {
    type: String,
    trim: true
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
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Timestamps
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
futsalOwnerSchema.index({ email: 1 });
futsalOwnerSchema.index({ status: 1 });

module.exports = mongoose.model('FutsalOwner', futsalOwnerSchema);