const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { auditLogger } = require('../middleware/auditLogger');

router.use(authenticate);
router.use(authorize('ADMIN'));

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users', auditLogger('User'), adminController.createUser);
router.put('/users/:id', auditLogger('User'), adminController.updateUser);
router.delete('/users/:id', auditLogger('User'), adminController.deleteUser);

// Goal management
router.post('/goals/:goalId/unlock', auditLogger('Goal'), adminController.unlockGoal);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Analytics
router.get('/analytics', adminController.getAnalytics);
router.get('/stats', adminController.getSystemStats);

// Escalations
router.get('/escalations', adminController.getEscalations);
router.post('/escalations/:escalationId/resolve', adminController.resolveEscalation);
router.post('/escalations/trigger', adminController.triggerEscalationCheck);

module.exports = router;