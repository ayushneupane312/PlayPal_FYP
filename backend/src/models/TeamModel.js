const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['leader', 'member'],
    default: 'member'
  },
  position: {
    type: String,
    enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Any'],
    default: 'Any'
  },
  joinedAt: { type: Date, default: Date.now }
});

const joinRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: String, default: 'Any' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: Date,
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [teamMemberSchema],
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  maxPlayers: {
    type: Number,
    required: true,
    default: 10
  },
  matchFormat: {
    type: String,
    enum: ['5v5', '6v6', '7v7'],
    default: '5v5'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowAutoFill: {
    type: Boolean,
    default: false
  },
  description: { type: String, trim: true, maxlength: 500 },
  joinRequests: [joinRequestSchema],
  status: {
    type: String,
    enum: ['forming', 'ready', 'booked', 'cancelled'],
    default: 'forming'
  },
  // For match link when status is booked
  matchRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  bookingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
}, { timestamps: true });

teamSchema.index({ leader: 1 });
teamSchema.index({ status: 1 });
teamSchema.index({ isPublic: 1, status: 1 });
teamSchema.index({ 'players.user': 1 });

module.exports = mongoose.model('Team', teamSchema);
