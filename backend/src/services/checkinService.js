const CheckIn = require('../models/CheckIn');
const Achievement = require('../models/Achievement');
const Goal = require('../models/Goal');
const Cycle = require('../models/Cycle');
const calculationService = require('./calculationService');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errorTypes');

class CheckInService {
  async updateAchievement(goalId, userId, quarter, achievementData) {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    if (goal.employee_id !== userId) {
      throw new ForbiddenError('You can only update your own achievements');
    }

    if (!goal.is_locked) {
      throw new ValidationError('Goal must be approved before tracking achievements');
    }

    // Calculate progress score
    const progressScore = calculationService.calculateProgressScore(
      goal.uom_type,
      goal.target,
      achievementData.actual_achievement
    );

    // Determine status if not provided
    const status = achievementData.status || 
      calculationService.determineAchievementStatus(progressScore);

    const achievement = await Achievement.create({
      goal_id: goalId,
      quarter,
      planned_target: achievementData.planned_target || goal.target,
      actual_achievement: achievementData.actual_achievement,
      status,
      progress_score: progressScore,
      notes: achievementData.notes
    });

    // If this is a shared goal, update all linked goals
    if (goal.shared_parent_id) {
      await Goal.updateSharedGoalAchievements(
        goal.shared_parent_id,
        quarter,
        achievementData.actual_achievement
      );
    } else if (goal.is_shared && !goal.shared_parent_id) {
      // This is a parent shared goal
      await Goal.updateSharedGoalAchievements(
        goalId,
        quarter,
        achievementData.actual_achievement
      );
    }

    return achievement;
  }

  async conductCheckIn(goalId, managerId, quarter, comment) {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    // Verify manager relationship
    const { query } = require('../config/database');
    const result = await query(
      'SELECT manager_id FROM users WHERE id = $1',
      [goal.employee_id]
    );

    if (result.rows[0].manager_id !== managerId) {
      throw new ForbiddenError('You are not the manager of this employee');
    }

    // Verify achievement exists for this quarter
    const achievement = await Achievement.findByGoalAndQuarter(goalId, quarter);
    
    if (!achievement) {
      throw new ValidationError('Employee must update achievement before check-in');
    }

    const checkIn = await CheckIn.create({
      goal_id: goalId,
      quarter,
      manager_id: managerId,
      comment
    });

    return checkIn;
  }

  async getEmployeeCheckInStatus(employeeId, cycleId, quarter) {
    const goals = await Goal.findByEmployee(employeeId, cycleId);
    const achievements = await Achievement.findByEmployee(employeeId, cycleId, quarter);

    const status = {
      total_goals: goals.filter(g => g.is_locked).length,
      achievements_updated: achievements.length,
      checkins_completed: 0,
      pending_checkins: []
    };

    for (const goal of goals.filter(g => g.is_locked)) {
      const checkIn = await CheckIn.findByGoalAndQuarter(goal.id, quarter);
      if (checkIn) {
        status.checkins_completed++;
      } else {
        status.pending_checkins.push({
          goal_id: goal.id,
          goal_title: goal.title
        });
      }
    }

    return status;
  }

  async getManagerCheckInStatus(managerId, cycleId, quarter) {
    const teamGoals = await Goal.findByManager(managerId, cycleId);
    const lockedGoals = teamGoals.filter(g => g.is_locked);

    const status = {
      total_employees: new Set(lockedGoals.map(g => g.employee_id)).size,
      total_goals: lockedGoals.length,
      checkins_completed: 0,
      pending_checkins: []
    };

    for (const goal of lockedGoals) {
      const checkIn = await CheckIn.findByGoalAndQuarter(goal.id, quarter);
      if (checkIn) {
        status.checkins_completed++;
      } else {
        const achievement = await Achievement.findByGoalAndQuarter(goal.id, quarter);
        if (achievement) {
          status.pending_checkins.push({
            goal_id: goal.id,
            goal_title: goal.title,
            employee_name: goal.employee_name,
            employee_email: goal.employee_email
          });
        }
      }
    }

    return status;
  }
}

module.exports = new CheckInService();