const User = require('../models/User');
const Goal = require('../models/Goal');
const { query } = require('../config/database');
const analyticsService = require('../services/analyticsService');
const escalationService = require('../services/escalationService');
const ResponseHandler = require('../utils/responseHandler');
const { ValidationError } = require('../utils/errorTypes');

class AdminController {
  async getAllUsers(req, res, next) {
    try {
      const { role, department_id, is_active } = req.query;
      const users = await User.findAll({ role, department_id, is_active });
      return ResponseHandler.success(res, users, 'Users retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await User.create(req.body);
      return ResponseHandler.created(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await User.update(req.params.id, req.body);
      return ResponseHandler.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await User.delete(req.params.id);
      return ResponseHandler.success(res, null, 'User deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  async unlockGoal(req, res, next) {
    try {
      const goal = await Goal.unlock(req.params.goalId);
      return ResponseHandler.success(res, goal, 'Goal unlocked successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const { entity_type, entity_id, user_id, limit = 100 } = req.query;

      let queryText = 'SELECT * FROM audit_logs WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (entity_type) {
        queryText += ` AND entity_type = $${paramCount}`;
        params.push(entity_type);
        paramCount++;
      }

      if (entity_id) {
        queryText += ` AND entity_id = $${paramCount}`;
        params.push(entity_id);
        paramCount++;
      }

      if (user_id) {
        queryText += ` AND user_id = $${paramCount}`;
        params.push(user_id);
        paramCount++;
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
      params.push(limit);

      const result = await query(queryText, params);
      return ResponseHandler.success(res, result.rows, 'Audit logs retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const { cycle_id, type } = req.query;

      if (!cycle_id) {
        throw new ValidationError('Cycle ID is required');
      }

      let data;

      switch (type) {
        case 'goal_distribution':
          data = await analyticsService.getGoalDistribution(cycle_id);
          break;
        case 'uom_distribution':
          data = await analyticsService.getUOMDistribution(cycle_id);
          break;
        case 'progress_trends':
          data = await analyticsService.getProgressTrends(cycle_id);
          break;
        case 'department_performance':
          data = await analyticsService.getDepartmentPerformance(cycle_id);
          break;
        case 'manager_effectiveness':
          data = await analyticsService.getManagerEffectiveness(cycle_id);
          break;
        case 'top_performers':
          data = await analyticsService.getTopPerformers(cycle_id, req.query.limit || 10);
          break;
        default:
          throw new ValidationError('Invalid analytics type');
      }

      return ResponseHandler.success(res, data, 'Analytics data retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getSystemStats(req, res, next) {
    try {
      const stats = await analyticsService.getSystemStats();
      return ResponseHandler.success(res, stats, 'System stats retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getEscalations(req, res, next) {
    try {
      const { rule_type, user_id } = req.query;
      const escalations = await escalationService.getActiveEscalations({
        rule_type,
        user_id
      });
      return ResponseHandler.success(res, escalations, 'Escalations retrieved');
    } catch (error) {
      next(error);
    }
  }

  async resolveEscalation(req, res, next) {
    try {
      const { notes } = req.body;
      const escalation = await escalationService.resolveEscalation(
        req.params.escalationId,
        notes
      );
      return ResponseHandler.success(res, escalation, 'Escalation resolved');
    } catch (error) {
      next(error);
    }
  }

  async triggerEscalationCheck(req, res, next) {
    try {
      const { type } = req.body;

      let count = 0;
      switch (type) {
        case 'NO_SUBMISSION':
          count = await escalationService.checkNoSubmission();
          break;
        case 'NO_APPROVAL':
          count = await escalationService.checkNoApproval();
          break;
        case 'NO_CHECKIN':
          count = await escalationService.checkNoCheckIn();
          break;
        default:
          throw new ValidationError('Invalid escalation type');
      }

      return ResponseHandler.success(
        res,
        { count },
        `${count} escalations triggered`
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();