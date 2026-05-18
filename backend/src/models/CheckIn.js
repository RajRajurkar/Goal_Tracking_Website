const { query } = require('../config/database');

class CheckIn {
  static async create(checkinData) {
    const { goal_id, quarter, manager_id, comment } = checkinData;

    const result = await query(
      `INSERT INTO checkins (goal_id, quarter, manager_id, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (goal_id, quarter)
       DO UPDATE SET comment = $4, checkin_date = CURRENT_TIMESTAMP
       RETURNING *`,
      [goal_id, quarter, manager_id, comment]
    );

    return result.rows[0];
  }

  static async findByGoalAndQuarter(goalId, quarter) {
    const result = await query(
      `SELECT c.*, u.name as manager_name
       FROM checkins c
       JOIN users u ON c.manager_id = u.id
       WHERE c.goal_id = $1 AND c.quarter = $2`,
      [goalId, quarter]
    );
    return result.rows[0];
  }

  static async findByGoal(goalId) {
    const result = await query(
      `SELECT c.*, u.name as manager_name
       FROM checkins c
       JOIN users u ON c.manager_id = u.id
       WHERE c.goal_id = $1
       ORDER BY c.quarter`,
      [goalId]
    );
    return result.rows;
  }

  static async getTeamCheckIns(managerId, cycleId, quarter = null) {
    let queryText = `
      SELECT c.*, g.title as goal_title, u.name as employee_name
      FROM checkins c
      JOIN goals g ON c.goal_id = g.id
      JOIN users u ON g.employee_id = u.id
      WHERE c.manager_id = $1 AND g.cycle_id = $2
    `;
    const params = [managerId, cycleId];

    if (quarter) {
      queryText += ` AND c.quarter = $3`;
      params.push(quarter);
    }

    queryText += ' ORDER BY c.checkin_date DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async getCheckInCompletion(cycleId, quarter) {
    const result = await query(
      `SELECT 
         COUNT(DISTINCT g.employee_id) as total_employees,
         COUNT(DISTINCT c.goal_id) as checkins_completed
       FROM goals g
       LEFT JOIN checkins c ON g.id = c.goal_id AND c.quarter = $2
       WHERE g.cycle_id = $1 AND g.status = 'LOCKED'`,
      [cycleId, quarter]
    );
    return result.rows[0];
  }
}

module.exports = CheckIn;