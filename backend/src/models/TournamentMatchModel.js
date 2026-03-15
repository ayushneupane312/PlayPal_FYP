const mongoose = require('mongoose');

const tournamentMatchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true
  },
  round: { type: String },
  stage: {
    type: String,
    enum: ['group', 'knockout'],
    default: 'knockout'
  },
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'TournamentTeam', required: true },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'TournamentTeam', required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  courtId: { type: mongoose.Schema.Types.ObjectId },
  matchDate: { type: Date },
  timeSlot: {
    startTime: String,
    endTime: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  score: {
    teamAGoals: { type: Number, default: 0 },
    teamBGoals: { type: Number, default: 0 }
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'TournamentTeam' }
}, { timestamps: true });

module.exports = mongoose.model('TournamentMatch', tournamentMatchSchema);

