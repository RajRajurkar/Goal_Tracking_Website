const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { auditLogger } = require('../middleware/auditLogger');
const { validateGoal, validateSharedGoal } = require('../validators/goalValidator');

router.use(authenticate);

router.post('/', validateGoal, auditLogger('Goal'), goalController.createGoal);
router.get('/my-goals', goalController.getMyGoals);
router.get('/:id', goalController.getGoalById);
router.put('/:id', validateGoal, auditLogger('Goal'), goalController.updateGoal);
router.delete('/:id', auditLogger('Goal'), goalController.deleteGoal);
router.post('/:id/submit', auditLogger('Goal'), goalController.submitForApproval);

router.get('/team/goals', authorize('MANAGER', 'ADMIN'), goalController.getTeamGoals);
router.post('/shared', authorize('MANAGER', 'ADMIN'), validateSharedGoal, auditLogger('Goal'), goalController.createSharedGoal);

module.exports = router;