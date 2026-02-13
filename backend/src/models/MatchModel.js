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
  // Leader who will confirm booking (from teamA or teamB - e.g. first team's leader)
  confirmedByLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  // Auto-match: which leader was assigned (e.g. highest rating or random)
  assignedLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

matchSchema.index({ status: 1 });
matchSchema.index({ date: 1 });

module.exports = mongoose.model('Match', matchSchema);
