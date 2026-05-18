const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const ResponseHandler = require('../utils/responseHandler');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(
      req.user.id,
      req.query.limit || 20
    );
    return ResponseHandler.success(res, notifications, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
});

router.get('/unread-count', async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    return ResponseHandler.success(res, { count }, 'Unread count retrieved');
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    return ResponseHandler.success(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return ResponseHandler.success(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
});

module.exports = router;