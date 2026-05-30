const admin = require('../config/firebaseAdmin');

/**
 * Send a push notification to a specific device token
 * @param {string} token - FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
const sendNotification = async (token, title, body, data = {}) => {
  if (!token) {
    console.error('No token provided for notification');
    return;
  }

  const message = {
    notification: {
      title,
      body,
    },
    data,
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

module.exports = { sendNotification };
