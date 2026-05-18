const { query } = require('../config/database');

class Achievement {
  static async create(achievementData) {
    const {
      goal_id,
      quarter,
      planned_target,
      actual_achievement,
      status,
      progress_score,
      notes
    } = achievementData;

    const result = await query(
      `INSERT INTO achievements 
       (goal_id, quarter, planned_target, actual_achievement, status, progress_score, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (goal_id, quarter) 
       DO UPDATE SET 
         planned_target = $3,
         actual_achievement = $4,
         status = $5,
         progress_score = $6,
         notes = $7,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [goal_id, quarter, planned_target, actual_achievement, status, progress_score, notes]
    );

    return result.rows[0];
  }

  static async findByGoalAndQuarter(goalId, quarter) {
    const result = await query(
      `SELECT * FROM achievements WHERE goal_id = $1 AND quarter = $2`,
      [goalId, quarter]
    );
    return result.rows[0];
  }

  static async findByGoal(goalId) {
    const result = await query(
      `SELECT * FROM achievements WHERE goal_id = $1 ORDER BY quarter`,
      [goalId]
    );
    return result.rows;
  }

  static async findByEmployee(employeeId, cycleId, quarter = null) {
    let queryText = `
      SELECT a.*, g.title as goal_title, g.uom_type, g.target, g.weightage
      FROM achievements a
      JOIN goals g ON a.goal_id = g.id
      WHERE g.employee_id = $1 AND g.cycle_id = $2
    `;
    const params = [employeeId, cycleId];

    if (quarter) {
      queryText += ` AND a.quarter = $3`;
      params.push(quarter);
    }

    queryText += ' ORDER BY a.quarter, g.created_at';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async update(goalId, quarter, updates) {
    const allowedFields = ['planned_target', 'actual_achievement', 'status', 'progress_score', 'notes'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(goalId);
    values.push(quarter);

    const result = await query(
      `UPDATE achievements SET ${fields.join(', ')} 
       WHERE goal_id = $${paramCount} AND quarter = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async getTeamAchievements(managerId, cycleId, quarter = null) {
    let queryText = `
      SELECT a.*, g.title as goal_title, g.uom_type, g.target, g.weightage,
             u.name as employee_name, u.email as employee_email
      FROM achievements a
      JOIN goals g ON a.goal_id = g.id
      JOIN users u ON g.employee_id = u.id
      WHERE u.manager_id = $1 AND g.cycle_id = $2
    `;
    const params = [managerId, cycleId];

    if (quarter) {
      queryText += ` AND a.quarter = $3`;
      params.push(quarter);
    }

    queryText += ' ORDER BY u.name, a.quarter, g.created_at';

    const result = await query(queryText, params);
    return result.rows;
  }
}

module.exports = Achievement;