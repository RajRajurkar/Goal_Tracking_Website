const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/:goalId', commentController.getComments);
router.post('/:goalId', commentController.addComment);

module.exports = router;
