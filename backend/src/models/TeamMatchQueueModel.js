const mongoose = require('mongoose');

const teamMatchQueueSchema = new mongoose.Schema(
  {
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
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    timeSlot: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    },
    teamSize: {
      type: Number,
      required: true,
      min: 2
    },
    status: {
      type: String,
      enum: ['searching', 'matched', 'cancelled'],
      default: 'searching'
    },
    matchRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    }
  },
  { timestamps: true }
);

teamMatchQueueSchema.index({ status: 1, venue: 1, date: 1, 'timeSlot.startTime': 1, teamSize: 1 });
teamMatchQueueSchema.index({ team: 1, status: 1 });

module.exports = mongoose.model('TeamMatchQueue', teamMatchQueueSchema);

