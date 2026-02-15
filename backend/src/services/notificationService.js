const Notification = require('../models/NotificationModel');
const User = require('../models/UserModel');

let ioInstance = null;
const userSockets = new Map(); // userId => Set<socketId>

function addSocket(userId, socketId) {
  const key = userId.toString();
  if (!userSockets.has(key)) {
    userSockets.set(key, new Set());
  }
  userSockets.get(key).add(socketId);
}

function removeSocket(socketId) {
  for (const [userId, sockets] of userSockets.entries()) {
    if (sockets.has(socketId)) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        userSockets.delete(userId);
      }
      break;
    }
  }
}

function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  const key = userId.toString();
  const sockets = userSockets.get(key);
  if (!sockets) return;
  sockets.forEach((sid) => {
    ioInstance.to(sid).emit(event, payload);
  });
}

/**
 * Initialize socket.io handlers for notifications.
 * Frontend should connect and then emit `register` with { userId, role }.
 */
function initNotificationSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('register', ({ userId }) => {
      if (!userId) return;
      addSocket(userId, socket.id);
    });

    socket.on('disconnect', () => {
      removeSocket(socket.id);
    });
  });
}

async function createNotification({ userId, role, title, message, type, link, meta }) {
  if (!userId) return null;
  const doc = await Notification.create({
    user: userId,
    role,
    title,
    message,
    type,
    link,
    meta: meta || {}
  });

  emitToUser(userId, 'notification:new', doc);
  return doc;
}

async function notifyUser(userId, payload) {
  return createNotification({ userId, ...payload });
}

async function notifyRole(role, payload) {
  const users = await User.find({ role }).select('_id');
  const results = [];
  for (const u of users) {
    results.push(await createNotification({ userId: u._id, role, ...payload }));
  }
  return results;
}

module.exports = {
  initNotificationSocket,
  notifyUser,
  notifyRole
};

