const { query } = require('../config/database');

class Approval {
  static async create(approvalData) {
    const {
      goal_id,
      manager_id,
      action,
      comment,
      previous_data,
      new_data
    } = approvalData;

    const result = await query(
      `INSERT INTO approvals (goal_id, manager_id, action, comment, previous_data, new_data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [goal_id, manager_id, action, comment, JSON.stringify(previous_data), JSON.stringify(new_data)]
    );

    return result.rows[0];
  }

  static async findByGoal(goalId) {
    const result = await query(
      `SELECT a.*, u.name as manager_name
       FROM approvals a
       JOIN users u ON a.manager_id = u.id
       WHERE a.goal_id = $1
       ORDER BY a.created_at DESC`,
      [goalId]
    );
    return result.rows;
  }

  static async findByManager(managerId, limit = 50) {
    const result = await query(
      `SELECT a.*, g.title as goal_title, u.name as employee_name
       FROM approvals a
       JOIN goals g ON a.goal_id = g.id
       JOIN users u ON g.employee_id = u.id
       WHERE a.manager_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [managerId, limit]
    );
    return result.rows;
  }

  static async getApprovalStats(managerId, cycleId) {
    const result = await query(
      `SELECT 
         COUNT(*) FILTER (WHERE a.action = 'APPROVE') as approved,
         COUNT(*) FILTER (WHERE a.action = 'REJECT') as rejected,
         COUNT(*) FILTER (WHERE a.action = 'RETURN_FOR_REWORK') as returned,
         COUNT(*) as total
       FROM approvals a
       JOIN goals g ON a.goal_id = g.id
       WHERE a.manager_id = $1 AND g.cycle_id = $2`,
      [managerId, cycleId]
    );
    return result.rows[0];
  }
}

module.exports = Approval;