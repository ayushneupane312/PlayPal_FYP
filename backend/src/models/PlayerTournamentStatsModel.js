const mongoose = require('mongoose');

const playerTournamentStatsSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentTeam'
  },
  matchesPlayed: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  cleanSheets: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 }
}, { timestamps: true });

playerTournamentStatsSchema.index({ tournament: 1, player: 1 }, { unique: true });

module.exports = mongoose.model('PlayerTournamentStats', playerTournamentStatsSchema);

