const goalService = require('../services/goalService');
const Goal = require('../models/Goal');
const ResponseHandler = require('../utils/responseHandler');
const { ValidationError } = require('../utils/errorTypes');

class GoalController {
  async createGoal(req, res, next) {
    try {
      const goal = await goalService.createGoal(req.user.id, req.body);
      return ResponseHandler.created(res, goal, 'Goal created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyGoals(req, res, next) {
    try {
      const { cycle_id } = req.query;
      const goals = await Goal.findByEmployee(req.user.id, cycle_id);
      return ResponseHandler.success(res, goals, 'Goals retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getGoalById(req, res, next) {
    try {
      const goal = await Goal.findById(req.params.id);
      
      if (!goal) {
        throw new ValidationError('Goal not found');
      }

      // Check if user has access to this goal
      if (goal.employee_id !== req.user.id && req.user.role !== 'ADMIN') {
        const User = require('../models/User');
        const employee = await User.findById(goal.employee_id);
        if (employee.manager_id !== req.user.id) {
          throw new ValidationError('Access denied');
        }
      }

      return ResponseHandler.success(res, goal, 'Goal retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateGoal(req, res, next) {
    try {
      const goal = await goalService.updateGoal(
        req.params.id,
        req.user.id,
        req.body
      );
      return ResponseHandler.success(res, goal, 'Goal updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteGoal(req, res, next) {
    try {
      await goalService.deleteGoal(req.params.id, req.user.id);
      return ResponseHandler.success(res, null, 'Goal deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async submitForApproval(req, res, next) {
    try {
      const goal = await goalService.submitForApproval(req.params.id, req.user.id);
      return ResponseHandler.success(res, goal, 'Goal submitted for approval');
    } catch (error) {
      next(error);
    }
  }

  async createSharedGoal(req, res, next) {
    try {
      const { employee_ids, ...goalData } = req.body;

      if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
        throw new ValidationError('Employee IDs array is required');
      }

      const result = await goalService.createSharedGoal(
        req.user.id,
        goalData,
        employee_ids
      );

      return ResponseHandler.created(res, result, 'Shared goal created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTeamGoals(req, res, next) {
    try {
      const { cycle_id } = req.query;
      const goals = await Goal.findByManager(req.user.id, cycle_id);
      return ResponseHandler.success(res, goals, 'Team goals retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GoalController();