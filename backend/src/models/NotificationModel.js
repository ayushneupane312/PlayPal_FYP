const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional: store role (player / futsalowner / admin)
  role: {
    type: String,
    enum: ['player', 'futsalowner', 'admin'],
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'booking_created',
      'booking_status',
      'team_invite',
      'team_join_request',
      'team_join_result',
      'match_found',
      'admin_alert',
      'system',
      'tournament_created',
      'tournament_registration',
      'tournament_update'
    ],
    default: 'system'
  },
  // Optional deep link the frontend can navigate to
  link: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  meta: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

