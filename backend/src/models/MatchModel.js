const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  court: {
    courtId: mongoose.Schema.Types.ObjectId,
    name: String,
    surfaceType: String
  },
  date: { type: Date },
  timeSlot: {
    startTime: String,
    endTime: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },

  // ── Challenge system ──────────────────────────────────────
  challengeStatus: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending'
  },
  challengeMessage:   { type: String, trim: true, default: '' },
  declineReason:      { type: String, trim: true, default: '' },
  challengedAt:       { type: Date },
  confirmedAt:        { type: Date },
  declinedAt:         { type: Date },
  cancelledAt:        { type: Date },

  // Leader who will confirm booking (from teamA or teamB)
  confirmedByLeader:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookingRef:         { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  // Auto-match or challenge sender
  assignedLeader:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

matchSchema.index({ status: 1 });
matchSchema.index({ date: 1 });
matchSchema.index({ teamA: 1, teamB: 1 });

module.exports = mongoose.model('Match', matchSchema);