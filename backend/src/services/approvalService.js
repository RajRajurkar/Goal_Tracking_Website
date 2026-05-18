const Goal = require('../models/Goal');
const Approval = require('../models/Approval');
const User = require('../models/User');
const { APPROVAL_ACTIONS, GOAL_STATUS } = require('../config/constants');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errorTypes');
const emailService = require('./emailService');

class ApprovalService {
  async approveGoal(goalId, managerId, comment = '', edits = null) {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    // Verify manager relationship
    const employee = await User.findById(goal.employee_id);
    if (employee.manager_id !== managerId) {
      throw new ForbiddenError('You are not the manager of this employee');
    }

    if (goal.status !== GOAL_STATUS.PENDING_APPROVAL) {
      throw new ValidationError('Goal is not pending approval');
    }

    const previousData = { ...goal };

    // Apply edits if provided
    if (edits) {
      await Goal.update(goalId, edits);
    }

    // Lock the goal
    const updatedGoal = await Goal.lock(goalId, managerId);

    // Create approval record
    await Approval.create({
      goal_id: goalId,
      manager_id: managerId,
      action: APPROVAL_ACTIONS.APPROVE,
      comment,
      previous_data: previousData,
      new_data: edits || {}
    });

    // Send notification
    await emailService.sendGoalApprovedEmail(employee, goal);

    return updatedGoal;
  }

  async rejectGoal(goalId, managerId, comment) {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    const employee = await User.findById(goal.employee_id);
    if (employee.manager_id !== managerId) {
      throw new ForbiddenError('You are not the manager of this employee');
    }

    if (goal.status !== GOAL_STATUS.PENDING_APPROVAL) {
      throw new ValidationError('Goal is not pending approval');
    }

    // Update goal status
    await Goal.update(goalId, { status: GOAL_STATUS.REJECTED });

    // Create approval record
    await Approval.create({
      goal_id: goalId,
      manager_id: managerId,
      action: APPROVAL_ACTIONS.REJECT,
      comment,
      previous_data: goal,
      new_data: {}
    });

    // Send notification
    await emailService.sendGoalRejectedEmail(employee, goal, comment);

    return goal;
  }

  async returnForRework(goalId, managerId, comment) {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    const employee = await User.findById(goal.employee_id);
    if (employee.manager_id !== managerId) {
      throw new ForbiddenError('You are not the manager of this employee');
    }

    if (goal.status !== GOAL_STATUS.PENDING_APPROVAL) {
      throw new ValidationError('Goal is not pending approval');
    }

    // Update goal status back to draft
    await Goal.update(goalId, { status: GOAL_STATUS.DRAFT });

    // Create approval record
    await Approval.create({
      goal_id: goalId,
      manager_id: managerId,
      action: APPROVAL_ACTIONS.RETURN_FOR_REWORK,
      comment,
      previous_data: goal,
      new_data: {}
    });

    // Send notification
    await emailService.sendGoalReturnedEmail(employee, goal, comment);

    return goal;
  }

  async getPendingApprovals(managerId) {
    return await Goal.getPendingApprovals(managerId);
  }
}

module.exports = new ApprovalService();