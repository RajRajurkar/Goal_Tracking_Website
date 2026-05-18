const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { auditLogger } = require('../middleware/auditLogger');

router.use(authenticate);
router.use(authorize('MANAGER', 'ADMIN'));

router.get('/pending', approvalController.getPendingApprovals);
router.get('/my-approvals', approvalController.getMyApprovals);
router.get('/:goalId/history', approvalController.getApprovalHistory);

router.post(
  '/:goalId/approve',
  auditLogger('Approval'),
  approvalController.approveGoal
);
router.post(
  '/:goalId/reject',
  auditLogger('Approval'),
  approvalController.rejectGoal
);
router.post(
  '/:goalId/return',
  auditLogger('Approval'),
  approvalController.returnForRework
);

module.exports = router;