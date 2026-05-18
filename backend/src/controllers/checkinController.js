const checkinService = require('../services/checkinService');
const Achievement = require('../models/Achievement');
const CheckIn = require('../models/CheckIn');
const ResponseHandler = require('../utils/responseHandler');
const { ValidationError } = require('../utils/errorTypes');

class CheckInController {
  async updateAchievement(req, res, next) {
    try {
      const { quarter, actual_achievement, planned_target, status, notes } = req.body;

      if (!quarter || !actual_achievement) {
        throw new ValidationError('Quarter and actual achievement are required');
      }

      const achievement = await checkinService.updateAchievement(
        req.params.goalId,
        req.user.id,
        quarter,
        { actual_achievement, planned_target, status, notes }
      );

      return ResponseHandler.success(res, achievement, 'Achievement updated');
    } catch (error) {
      next(error);
    }
  }

  async conductCheckIn(req, res, next) {
    try {
      const { quarter, comment } = req.body;

      if (!quarter || !comment) {
        throw new ValidationError('Quarter and comment are required');
      }

      const checkIn = await checkinService.conductCheckIn(
        req.params.goalId,
        req.user.id,
        quarter,
        comment
      );

      return ResponseHandler.success(res, checkIn, 'Check-in completed');
    } catch (error) {
      next(error);
    }
  }

  async getMyAchievements(req, res, next) {
    try {
      const { cycle_id, quarter } = req.query;

      if (!cycle_id) {
        throw new ValidationError('Cycle ID is required');
      }

      const achievements = await Achievement.findByEmployee(
        req.user.id,
        cycle_id,
        quarter
      );

      return ResponseHandler.success(res, achievements, 'Achievements retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getTeamAchievements(req, res, next) {
    try {
      const { cycle_id, quarter } = req.query;

      if (!cycle_id) {
        throw new ValidationError('Cycle ID is required');
      }

      const achievements = await Achievement.getTeamAchievements(
        req.user.id,
        cycle_id,
        quarter
      );

      return ResponseHandler.success(res, achievements, 'Team achievements retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getCheckInStatus(req, res, next) {
    try {
      const { cycle_id, quarter } = req.query;

      if (!cycle_id || !quarter) {
        throw new ValidationError('Cycle ID and quarter are required');
      }

      let status;
      if (req.user.role === 'EMPLOYEE') {
        status = await checkinService.getEmployeeCheckInStatus(
          req.user.id,
          cycle_id,
          quarter
        );
      } else if (req.user.role === 'MANAGER') {
        status = await checkinService.getManagerCheckInStatus(
          req.user.id,
          cycle_id,
          quarter
        );
      }

      return ResponseHandler.success(res, status, 'Check-in status retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckInController();