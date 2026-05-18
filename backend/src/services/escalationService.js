const { query } = require('../config/database');
const Cycle = require('../models/Cycle');
const Goal = require('../models/Goal');
const emailService = require('./emailService');
const User = require('../models/User');
const {
  ESCALATION_NO_SUBMISSION_DAYS,
  ESCALATION_NO_APPROVAL_DAYS,
  ESCALATION_NO_CHECKIN_DAYS
} = require('../config/env');
const { ESCALATION_TYPES } = require('../config/constants');
const { logger } = require('../utils/logger');

class EscalationService {
  async checkNoSubmission() {
    const activeCycle = await Cycle.findActive();
    if (!activeCycle) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ESCALATION_NO_SUBMISSION_DAYS);

    const result = await query(`
      SELECT DISTINCT u.id, u.name, u.email, u.manager_id, m.name as manager_name, m.email as manager_email
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      LEFT JOIN goals g ON u.id = g.employee_id AND g.cycle_id = $1
      WHERE u.role = 'EMPLOYEE' 
        AND u.is_active = true
        AND g.id IS NULL
        AND u.created_at < $2
    `, [activeCycle.id, cutoffDate]);

    for (const user of result.rows) {
      await this.createEscalation(
        ESCALATION_TYPES.NO_SUBMISSION,
        null,
        user.id
      );

      // Send email to employee
      await emailService.sendEscalationEmail(
        user,
        'Goal Submission Overdue',
        `You have not submitted your goals for ${activeCycle.name}. Please submit them as soon as possible.`
      );

      // Send email to manager
      if (user.manager_id) {
        const manager = await User.findById(user.manager_id);
        await emailService.sendEscalationEmail(
          manager,
          'Team Member Goal Submission Overdue',
          `${user.name} has not submitted goals for ${activeCycle.name}.`
        );
      }

      logger.info(`Escalation sent for no submission: ${user.email}`);
    }

    return result.rows.length;
  }

  async checkNoApproval() {
    const activeCycle = await Cycle.findActive();
    if (!activeCycle) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ESCALATION_NO_APPROVAL_DAYS);

    const result = await query(`
      SELECT g.id as goal_id, g.title, g.created_at,
             u.id as employee_id, u.name as employee_name, u.email as employee_email,
             m.id as manager_id, m.name as manager_name, m.email as manager_email
      FROM goals g
      JOIN users u ON g.employee_id = u.id
      JOIN users m ON u.manager_id = m.id
      WHERE g.cycle_id = $1 
        AND g.status = 'PENDING_APPROVAL'
        AND g.created_at < $2
    `, [activeCycle.id, cutoffDate]);

    for (const row of result.rows) {
      await this.createEscalation(
        ESCALATION_TYPES.NO_APPROVAL,
        row.goal_id,
        row.manager_id
      );

      // Send email to manager
      const manager = await User.findById(row.manager_id);
      await emailService.sendEscalationEmail(
        manager,
        'Goal Approval Pending',
        `Goal "${row.title}" from ${row.employee_name} is pending your approval for ${ESCALATION_NO_APPROVAL_DAYS} days.`
      );

      logger.info(`Escalation sent for no approval: Goal ${row.goal_id}`);
    }

    return result.rows.length;
  }

  async checkNoCheckIn() {
    const activeCycle = await Cycle.findActive();
    if (!activeCycle) return;

    const currentQuarter = await Cycle.getCurrentQuarter(activeCycle.id);
    if (!currentQuarter) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ESCALATION_NO_CHECKIN_DAYS);

    const result = await query(`
      SELECT g.id as goal_id, g.title,
             u.id as employee_id, u.name as employee_name, u.email as employee_email,
             m.id as manager_id, m.name as manager_name, m.email as manager_email
      FROM goals g
      JOIN users u ON g.employee_id = u.id
      JOIN users m ON u.manager_id = m.id
      LEFT JOIN achievements a ON g.id = a.goal_id AND a.quarter = $2
      LEFT JOIN checkins c ON g.id = c.goal_id AND c.quarter = $2
      WHERE g.cycle_id = $1 
        AND g.is_locked = true
        AND a.id IS NOT NULL
        AND c.id IS NULL
        AND $3 < $4
    `, [activeCycle.id, currentQuarter.quarter, new Date(currentQuarter.start), cutoffDate]);

    for (const row of result.rows) {
      await this.createEscalation(
        ESCALATION_TYPES.NO_CHECKIN,
        row.goal_id,
        row.manager_id
      );

      // Send email to manager
      const manager = await User.findById(row.manager_id);
      await emailService.sendEscalationEmail(
        manager,
        `${currentQuarter.quarter} Check-In Pending`,
        `Check-in pending for ${row.employee_name}'s goal: "${row.title}"`
      );

      logger.info(`Escalation sent for no check-in: Goal ${row.goal_id}`);
    }

    return result.rows.length;
  }

  async createEscalation(ruleType, entityId, userId) {
    const result = await query(
      `INSERT INTO escalations (rule_type, entity_id, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ruleType, entityId, userId]
    );

    return result.rows[0];
  }

  async resolveEscalation(escalationId, notes) {
    const result = await query(
      `UPDATE escalations 
       SET resolved_at = CURRENT_TIMESTAMP, resolution_notes = $2
       WHERE id = $1
       RETURNING *`,
      [escalationId, notes]
    );

    return result.rows[0];
  }

  async getActiveEscalations(filters = {}) {
    let queryText = `
      SELECT e.*, u.name as user_name, u.email as user_email
      FROM escalations e
      JOIN users u ON e.user_id = u.id
      WHERE e.resolved_at IS NULL
    `;
    const params = [];
    let paramCount = 1;

    if (filters.rule_type) {
      queryText += ` AND e.rule_type = $${paramCount}`;
      params.push(filters.rule_type);
      paramCount++;
    }

    if (filters.user_id) {
      queryText += ` AND e.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    queryText += ' ORDER BY e.sent_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }
}

module.exports = new EscalationService();