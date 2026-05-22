import axios from 'axios';
import API_BASE from '../utils/apiBase.js';

const NOTIFICATION_URL = `${API_BASE}/api/notifications`;

axios.defaults.withCredentials = true;

/**
 * Fetch current user's notifications
 */
export const getNotifications = async (limit = 20) => {
  const { data } = await axios.get(NOTIFICATION_URL, { params: { limit } });
  return data;
};

/**
 * Mark a single notification as read
 */
export const markNotificationRead = async (notificationId) => {
  const { data } = await axios.post(`${NOTIFICATION_URL}/mark-read`, { notificationId });
  return data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async () => {
  const { data } = await axios.post(`${NOTIFICATION_URL}/mark-all-read`);
  return data;
};

export default {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
