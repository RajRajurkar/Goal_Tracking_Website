const { query } = require('../config/database');
const { VALIDATION } = require('../config/constants');

class Goal {
  static async create(goalData) {
    const {
      employee_id,
      cycle_id,
      title,
      description,
      thrust_area,
      uom_type,
      target,
      weightage,
      is_shared,
      shared_parent_id
    } = goalData;

    const result = await query(
      `INSERT INTO goals 
       (employee_id, cycle_id, title, description, thrust_area, uom_type, target, weightage, is_shared, shared_parent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [employee_id, cycle_id, title, description, thrust_area, uom_type, target, weightage, is_shared, shared_parent_id]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT g.*, u.name as employee_name, u.email as employee_email, c.name as cycle_name
       FROM goals g
       JOIN users u ON g.employee_id = u.id
       JOIN cycles c ON g.cycle_id = c.id
       WHERE g.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByEmployee(employeeId, cycleId = null) {
    let queryText = `
      SELECT g.*, c.name as cycle_name
      FROM goals g
      JOIN cycles c ON g.cycle_id = c.id
      WHERE g.employee_id = $1
    `;
    const params = [employeeId];

    if (cycleId) {
      queryText += ` AND g.cycle_id = $2`;
      params.push(cycleId);
    }

    queryText += ' ORDER BY g.created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async findByManager(managerId, cycleId = null) {
    let queryText = `
      SELECT g.*, u.name as employee_name, u.email as employee_email, c.name as cycle_name
      FROM goals g
      JOIN users u ON g.employee_id = u.id
      JOIN cycles c ON g.cycle_id = c.id
      WHERE u.manager_id = $1
    `;
    const params = [managerId];

    if (cycleId) {
      queryText += ` AND g.cycle_id = $2`;
      params.push(cycleId);
    }

    queryText += ' ORDER BY g.status, u.name, g.created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async update(id, updates) {
    const allowedFields = ['title', 'description', 'thrust_area', 'target', 'weightage', 'status'];
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
    values.push(id);

    const result = await query(
      `UPDATE goals SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async lock(id, userId) {
    const result = await query(
      `UPDATE goals 
       SET is_locked = true, locked_at = CURRENT_TIMESTAMP, locked_by = $1, status = 'LOCKED'
       WHERE id = $2
       RETURNING *`,
      [userId, id]
    );
    return result.rows[0];
  }

  static async unlock(id) {
    const result = await query(
      `UPDATE goals 
       SET is_locked = false, locked_at = NULL, locked_by = NULL
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await query('DELETE FROM goals WHERE id = $1', [id]);
  }

  static async validateWeightage(employeeId, cycleId, excludeGoalId = null) {
    let queryText = `
      SELECT COALESCE(SUM(weightage), 0) as total_weightage, COUNT(*) as goal_count
      FROM goals
      WHERE employee_id = $1 AND cycle_id = $2 AND status != 'REJECTED'
    `;
    const params = [employeeId, cycleId];

    if (excludeGoalId) {
      queryText += ` AND id != $3`;
      params.push(excludeGoalId);
    }

    const result = await query(queryText, params);
    return result.rows[0];
  }

  static async getPendingApprovals(managerId) {
    const result = await query(
      `SELECT g.*, u.name as employee_name, u.email as employee_email, c.name as cycle_name
       FROM goals g
       JOIN users u ON g.employee_id = u.id
       JOIN cycles c ON g.cycle_id = c.id
       WHERE u.manager_id = $1 AND g.status = 'PENDING_APPROVAL'
       ORDER BY g.created_at ASC`,
      [managerId]
    );
    return result.rows;
  }

  static async getSharedGoalRecipients(parentGoalId) {
    const result = await query(
      `SELECT g.*, u.name as employee_name, u.email as employee_email
       FROM goals g
       JOIN users u ON g.employee_id = u.id
       WHERE g.shared_parent_id = $1
       ORDER BY u.name`,
      [parentGoalId]
    );
    return result.rows;
  }

  static async updateSharedGoalAchievements(parentGoalId, quarter, actualAchievement) {
    // Get all child goals
    const children = await this.getSharedGoalRecipients(parentGoalId);
    
    // Update achievements for all children
    const { query: dbQuery } = require('../config/database');
    
    for (const child of children) {
      await dbQuery(
        `INSERT INTO achievements (goal_id, quarter, actual_achievement, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (goal_id, quarter) 
         DO UPDATE SET actual_achievement = $3, updated_at = CURRENT_TIMESTAMP`,
        [child.id, quarter, actualAchievement]
      );
    }
  }
}

module.exports = Goal;