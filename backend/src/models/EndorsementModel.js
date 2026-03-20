const mongoose = require('mongoose');

const endorsementSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endorsedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  skills: [{
    type: String,
    enum: ['Shooting', 'Passing', 'Dribbling', 'Defense', 'Goalkeeping', 'Teamwork']
  }],
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  }
}, { timestamps: true });

// One endorsement per user per player
endorsementSchema.index({ player: 1, endorsedBy: 1 }, { unique: true });
endorsementSchema.index({ player: 1 });

module.exports = mongoose.model('Endorsement', endorsementSchema);
