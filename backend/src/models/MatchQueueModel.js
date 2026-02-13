const mongoose = require('mongoose');

const matchQueueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  position: {
    type: String,
    enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  availableDate: { type: Date, required: true },
  availableTimeSlot: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['waiting', 'matched', 'cancelled'],
    default: 'waiting'
  },
  matchedAt: Date,
  matchRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' }
}, { timestamps: true });

matchQueueSchema.index({ status: 1, skillLevel: 1 });
matchQueueSchema.index({ availableDate: 1 });
matchQueueSchema.index({ user: 1 });

module.exports = mongoose.model('MatchQueue', matchQueueSchema);
