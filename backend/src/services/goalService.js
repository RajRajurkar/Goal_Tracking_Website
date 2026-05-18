const Goal = require('../models/Goal');
const Cycle = require('../models/Cycle');
const { VALIDATION, GOAL_STATUS } = require('../config/constants');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errorTypes');

class GoalService {
  async createGoal(employeeId, goalData) {
    // Get active cycle
    const activeCycle = await Cycle.findActive();
    if (!activeCycle) {
      throw new ValidationError('No active cycle found');
    }

    // Validate weightage
    const { total_weightage, goal_count } = await Goal.validateWeightage(
      employeeId,
      activeCycle.id
    );

    if (parseInt(goal_count) >= VALIDATION.MAX_GOALS_PER_EMPLOYEE) {
      throw new ValidationError(`Maximum ${VALIDATION.MAX_GOALS_PER_EMPLOYEE} goals allowed`);
    }

    if (goalData.weightage < VALIDATION.MIN_WEIGHTAGE_PER_GOAL) {
      throw new ValidationError(`Minimum weightage per goal is ${VALIDATION.MIN_WEIGHTAGE_PER_GOAL}%`);
    }

    const newTotalWeightage = parseInt(total_weightage) + parseInt(goalData.weightage);
    if (newTotalWeightage > VALIDATION.TOTAL_WEIGHTAGE) {
      throw new ValidationError(
        `Total weightage would exceed 100%. Current: ${total_weightage}%, Adding: ${goalData.weightage}%`
      );
    }

    // Create goal
    const goal = await Goal.create({
      ...goalData,
      employee_id: employeeId,
      cycle_id: activeCycle.id,
      status: GOAL_STATUS.DRAFT
    });

    return goal;
  }

  async updateGoal(goalId, userId, updates) {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    if (goal.is_locked) {
      throw new ForbiddenError('Cannot update locked goal');
    }

    if (goal.employee_id !== userId) {
      throw new ForbiddenError('You can only update your own goals');
    }

    // Validate weightage if being updated
    if (updates.weightage) {
      const { total_weightage } = await Goal.validateWeightage(
        goal.employee_id,
        goal.cycle_id,
        goalId
      );

      const newTotalWeightage = parseInt(total_weightage) + parseInt(updates.weightage);
      if (newTotalWeightage > VALIDATION.TOTAL_WEIGHTAGE) {
        throw new ValidationError(
          `Total weightage would exceed 100%. Current: ${total_weightage}%, New goal: ${updates.weightage}%`
        );
      }
    }

    return await Goal.update(goalId, updates);
  }

  async submitForApproval(goalId, userId) {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    if (goal.employee_id !== userId) {
      throw new ForbiddenError('You can only submit your own goals');
    }

    if (goal.status !== GOAL_STATUS.DRAFT) {
      throw new ValidationError('Only draft goals can be submitted');
    }

    // Validate total weightage is 100%
    const { total_weightage } = await Goal.validateWeightage(
      goal.employee_id,
      goal.cycle_id
    );

    if (parseInt(total_weightage) !== VALIDATION.TOTAL_WEIGHTAGE) {
      throw new ValidationError(
        `Total weightage must be exactly 100%. Current: ${total_weightage}%`
      );
    }

    return await Goal.update(goalId, { status: GOAL_STATUS.PENDING_APPROVAL });
  }

  async createSharedGoal(managerId, goalData, employeeIds) {
    const activeCycle = await Cycle.findActive();
    if (!activeCycle) {
      throw new ValidationError('No active cycle found');
    }

    // Create parent shared goal
    const parentGoal = await Goal.create({
      ...goalData,
      employee_id: managerId, // Manager owns the parent
      cycle_id: activeCycle.id,
      is_shared: true,
      status: GOAL_STATUS.LOCKED
    });

    // Create child goals for each employee
    const childGoals = [];
    for (const employeeId of employeeIds) {
      const childGoal = await Goal.create({
        ...goalData,
        employee_id: employeeId,
        cycle_id: activeCycle.id,
        is_shared: true,
        shared_parent_id: parentGoal.id,
        status: GOAL_STATUS.LOCKED
      });
      childGoals.push(childGoal);
    }

    return { parentGoal, childGoals };
  }

  async deleteGoal(goalId, userId) {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    if (goal.employee_id !== userId) {
      throw new ForbiddenError('You can only delete your own goals');
    }

    if (goal.is_locked) {
      throw new ForbiddenError('Cannot delete locked goal');
    }

    await Goal.delete(goalId);
  }
}

module.exports = new GoalService();