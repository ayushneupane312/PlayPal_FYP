const mongoose = require('mongoose');

const tournamentTeamSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationDate: { type: Date, default: Date.now },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash'],
    default: 'cash'
  },
  notes: { type: String },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

tournamentTeamSchema.index({ tournament: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('TournamentTeam', tournamentTeamSchema);

