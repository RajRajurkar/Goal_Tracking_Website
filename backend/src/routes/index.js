const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const goalRoutes = require('./goal.routes');
const approvalRoutes = require('./approval.routes');
const checkinRoutes = require('./checkin.routes');
const cycleRoutes = require('./cycle.routes');
const reportRoutes = require('./report.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');
const aiRoutes = require('./ai.routes');
const commentRoutes = require('./comment.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/goals', goalRoutes);
router.use('/approvals', approvalRoutes);
router.use('/checkins', checkinRoutes);
router.use('/cycles', cycleRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/comments', commentRoutes);

module.exports = router;