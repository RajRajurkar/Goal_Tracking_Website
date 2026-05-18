const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validateRegister, validateChangePassword } = require('../validators/authValidator');

router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;