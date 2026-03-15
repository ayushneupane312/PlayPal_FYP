const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'winner',
      'runner_up',
      'best_player',
      'top_scorer',
      'best_goalkeeper',
      'rising_player',
      'fair_play',
      'custom'
    ],
    default: 'custom'
  },
  enabled: { type: Boolean, default: true },
  amount: { type: Number },
  reward: { type: String },
  description: { type: String }
}, { _id: false });

const tournamentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  bannerImage: { type: String },
  location: { type: String },

  format: {
    type: String,
    enum: ['knockout', 'group_knockout', 'round_robin'],
    default: 'knockout'
  },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },

  maxTeams: { type: Number, required: true, min: 2 },
  minPlayersPerTeam: { type: Number, default: 5 },

  entryFeePerTeam: { type: Number, required: true, min: 0 },
  paymentMethods: {
    type: [String],
    enum: ['online', 'cash'],
    default: ['cash']
  },

  prizes: [prizeSchema],

  status: {
    type: String,
    enum: [
      'draft',
      'upcoming',
      'registration_open',
      'registration_closed',
      'in_progress',
      'completed',
      'cancelled'
    ],
    default: 'registration_open',
    index: true
  },

  totalPrizePool: { type: Number, default: 0 },

  stats: {
    registeredTeams: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }
  }
}, { timestamps: true });

tournamentSchema.index({ startDate: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);

