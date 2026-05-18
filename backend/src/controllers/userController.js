const User = require('../models/User');
const ResponseHandler = require('../utils/responseHandler');

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      return ResponseHandler.success(res, user, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name } = req.body;
      const user = await User.update(req.user.id, { name });
      return ResponseHandler.success(res, user, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  async getTeamMembers(req, res, next) {
    try {
      const team = await User.getTeamMembers(req.user.id);
      return ResponseHandler.success(res, team, 'Team members retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getManager(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user.manager_id) {
        return ResponseHandler.success(res, null, 'No manager assigned');
      }

      const manager = await User.findById(user.manager_id);
      return ResponseHandler.success(res, manager, 'Manager retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();