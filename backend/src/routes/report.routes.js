const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(authenticate);

router.get('/achievement', reportController.getAchievementReport);
router.get('/achievement/csv', reportController.exportAchievementCSV);
router.get('/achievement/excel', reportController.exportAchievementExcel);
router.get('/completion-dashboard', reportController.getCompletionDashboard);
router.get(
  '/employee/:employeeId',
  authorize('MANAGER', 'ADMIN'),
  reportController.getEmployeeReport
);

module.exports = router;