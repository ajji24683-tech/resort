const Notification = require('../models/Notification');

/**
 * Create an in-app notification
 */
const createNotification = async (userId, title, message, type = 'system', link = '') => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};

module.exports = { createNotification };
