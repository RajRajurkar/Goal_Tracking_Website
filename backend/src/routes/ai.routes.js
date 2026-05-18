const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/aiService');
const ResponseHandler = require('../utils/responseHandler');

router.use(authenticate);

// Get goal suggestions based on title
router.post('/goal-suggestions', async (req, res, next) => {
  try {
    const { title, thrust_area } = req.body;
    const suggestions = aiService.generateGoalSuggestions(
      title,
      thrust_area,
      req.user.role
    );
    return ResponseHandler.success(res, suggestions, 'Suggestions generated');
  } catch (error) {
    next(error);
  }
});

// Get SMART score for a goal title
router.post('/smart-check', async (req, res, next) => {
  try {
    const { title } = req.body;
    const result = aiService.checkSMARTCriteria(title);
    return ResponseHandler.success(res, result, 'SMART check completed');
  } catch (error) {
    next(error);
  }
});

// Predict year-end performance
router.get('/predict/:employeeId', async (req, res, next) => {
  try {
    const { cycle_id } = req.query;
    const { query } = require('../config/database');

    const achievements = await query(`
      SELECT a.*, g.uom_type, g.target, g.weightage
      FROM achievements a
      JOIN goals g ON a.goal_id = g.id
      WHERE g.employee_id = $1 AND g.cycle_id = $2
      ORDER BY a.quarter
    `, [req.params.employeeId, cycle_id]);

    const goals = await query(
      'SELECT * FROM goals WHERE employee_id = $1 AND cycle_id = $2 AND is_locked = true',
      [req.params.employeeId, cycle_id]
    );

    const predictions = aiService.predictYearEndAchievement(
      achievements.rows,
      goals.rows
    );

    return ResponseHandler.success(res, predictions, 'Predictions generated');
  } catch (error) {
    next(error);
  }
});

// Get goal health score
router.get('/health/:goalId', async (req, res, next) => {
  try {
    const { query } = require('../config/database');

    const goal = await query('SELECT * FROM goals WHERE id = $1', [req.params.goalId]);
    const achievements = await query(
      'SELECT * FROM achievements WHERE goal_id = $1 ORDER BY quarter',
      [req.params.goalId]
    );
    const checkIns = await query(
      'SELECT * FROM checkins WHERE goal_id = $1',
      [req.params.goalId]
    );

    const healthScore = aiService.calculateGoalHealthScore(
      goal.rows[0],
      achievements.rows,
      checkIns.rows
    );

    return ResponseHandler.success(res, healthScore, 'Health score calculated');
  } catch (error) {
    next(error);
  }
});

module.exports = router;