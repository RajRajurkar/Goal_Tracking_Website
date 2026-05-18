const authService = require('../services/authService');
const ResponseHandler = require('../utils/responseHandler');
const { ValidationError } = require('../utils/errorTypes');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await authService.login(email, password);

      return ResponseHandler.success(
        res,
        result,
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const { email, password, name, role, department_id, manager_id } = req.body;

      if (!email || !password || !name || !role) {
        throw new ValidationError('Email, password, name, and role are required');
      }

      const result = await authService.register({
        email,
        password,
        name,
        role,
        department_id,
        manager_id
      });

      return ResponseHandler.created(
        res,
        result,
        'User registered successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        throw new ValidationError('Current and new passwords are required');
      }

      if (new_password.length < 6) {
        throw new ValidationError('New password must be at least 6 characters');
      }

      await authService.changePassword(
        req.user.id,
        current_password,
        new_password
      );

      return ResponseHandler.success(
        res,
        null,
        'Password changed successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);

      return ResponseHandler.success(res, user, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();