const approvalService = require('../services/approvalService');
const Approval = require('../models/Approval');
const ResponseHandler = require('../utils/responseHandler');

class ApprovalController {
  async getPendingApprovals(req, res, next) {
    try {
      const approvals = await approvalService.getPendingApprovals(req.user.id);
      return ResponseHandler.success(res, approvals, 'Pending approvals retrieved');
    } catch (error) {
      next(error);
    }
  }

  async approveGoal(req, res, next) {
    try {
      const { comment, edits } = req.body;
      
      const goal = await approvalService.approveGoal(
        req.params.goalId,
        req.user.id,
        comment,
        edits
      );

      return ResponseHandler.success(res, goal, 'Goal approved successfully');
    } catch (error) {
      next(error);
    }
  }

  async rejectGoal(req, res, next) {
    try {
      const { comment } = req.body;

      if (!comment) {
        throw new ValidationError('Comment is required for rejection');
      }

      const goal = await approvalService.rejectGoal(
        req.params.goalId,
        req.user.id,
        comment
      );

      return ResponseHandler.success(res, goal, 'Goal rejected');
    } catch (error) {
      next(error);
    }
  }

  async returnForRework(req, res, next) {
    try {
      const { comment } = req.body;

      if (!comment) {
        throw new ValidationError('Comment is required');
      }

      const goal = await approvalService.returnForRework(
        req.params.goalId,
        req.user.id,
        comment
      );

      return ResponseHandler.success(res, goal, 'Goal returned for rework');
    } catch (error) {
      next(error);
    }
  }

  async getApprovalHistory(req, res, next) {
    try {
      const history = await Approval.findByGoal(req.params.goalId);
      return ResponseHandler.success(res, history, 'Approval history retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getMyApprovals(req, res, next) {
    try {
      const { limit } = req.query;
      const approvals = await Approval.findByManager(req.user.id, limit || 50);
      return ResponseHandler.success(res, approvals, 'Approvals retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApprovalController();