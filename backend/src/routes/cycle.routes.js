const express = require('express');
const router = express.Router();
const cycleController = require('../controllers/cycleController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { auditLogger } = require('../middleware/auditLogger');
const { validateCycle } = require('../validators/cycleValidator');

router.use(authenticate);

router.get('/', cycleController.getAllCycles);
router.get('/active', cycleController.getActiveCycle);
router.get('/current-quarter', cycleController.getCurrentQuarter);
router.get('/:id', cycleController.getCycleById);

router.post('/', authorize('ADMIN'), validateCycle, auditLogger('Cycle'), cycleController.createCycle);
router.put('/:id', authorize('ADMIN'), validateCycle, auditLogger('Cycle'), cycleController.updateCycle);
router.post('/:id/activate', authorize('ADMIN'), auditLogger('Cycle'), cycleController.setActiveCycle);

module.exports = router;