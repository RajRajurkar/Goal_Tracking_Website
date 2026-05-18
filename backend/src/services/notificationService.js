const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const websocketService = require('./websocketService');

class NotificationService {
  async createNotification(userId, data) {
    try {
      const result = await query(
        `INSERT INTO notifications 
         (user_id, type, title, message, data, variant)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          userId,
          data.type,
          data.title,
          data.message,
          JSON.stringify(data.data || {}),
          data.variant || 'info'
        ]
      );

      // Send real-time notification via WebSocket
      websocketService.sendToUser(userId, {
        type: 'NEW_NOTIFICATION',
        notification: result.rows[0]
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create notification:', error);
    }
  }

  async getNotifications(userId, limit = 20) {
    const result = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  async markAsRead(notificationId, userId) {
    const result = await query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );
    return result.rows[0];
  }

  async markAllAsRead(userId) {
    await query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
  }

  async getUnreadCount(userId) {
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  async deleteOldNotifications() {
    // Delete notifications older than 90 days
    await query(
      `DELETE FROM notifications
       WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'`
    );
  }
}

module.exports = new NotificationService();