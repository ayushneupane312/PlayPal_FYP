const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const Notification = require('../models/NotificationModel');

// All notification routes are authenticated
router.use(verifyToken);

// GET /api/notifications - current user's notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20 } = req.query;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: err.message });
  }
});

// POST /api/notifications/mark-read
router.post('/mark-read', async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.body;
    if (!notificationId) {
      return res.status(400).json({ success: false, message: 'notificationId required' });
    }

    const notif = await Notification.findOne({ _id: notificationId, user: userId });
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notif.isRead = true;
    await notif.save();

    return res.status(200).json({ success: true, data: notif });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark as read', error: err.message });
  }
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', async (req, res) => {
  try {
    const userId = req.userId;
    await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read', error: err.message });
  }
});

module.exports = router;

