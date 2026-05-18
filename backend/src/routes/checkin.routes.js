const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { auditLogger } = require('../middleware/auditLogger');
const { validateAchievement, validateCheckIn } = require('../validators/checkinValidator');

router.use(authenticate);

router.post('/goals/:goalId/achievement', validateAchievement, auditLogger('Achievement'), checkinController.updateAchievement);
router.get('/my-achievements', checkinController.getMyAchievements);

router.post('/goals/:goalId/checkin', authorize('MANAGER', 'ADMIN'), validateCheckIn, auditLogger('CheckIn'), checkinController.conductCheckIn);
router.get('/team-achievements', authorize('MANAGER', 'ADMIN'), checkinController.getTeamAchievements);
router.get('/status', checkinController.getCheckInStatus);

module.exports = router;