const { query } = require('../config/database');

class AnalyticsService {
  async getGoalDistribution(cycleId) {
    const result = await query(`
      SELECT 
        thrust_area,
        COUNT(*) as count,
        AVG(weightage) as avg_weightage
      FROM goals
      WHERE cycle_id = $1 AND is_locked = true
      GROUP BY thrust_area
      ORDER BY count DESC
    `, [cycleId]);

    return result.rows;
  }

  async getUOMDistribution(cycleId) {
    const result = await query(`
      SELECT 
        uom_type,
        COUNT(*) as count
      FROM goals
      WHERE cycle_id = $1 AND is_locked = true
      GROUP BY uom_type
    `, [cycleId]);

    return result.rows;
  }

  async getProgressTrends(cycleId) {
    const result = await query(`
      SELECT 
        a.quarter,
        AVG(a.progress_score) as avg_score,
        COUNT(*) as total_achievements,
        COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END) as completed,
        COUNT(CASE WHEN a.status = 'ON_TRACK' THEN 1 END) as on_track,
        COUNT(CASE WHEN a.status = 'AT_RISK' THEN 1 END) as at_risk,
        COUNT(CASE WHEN a.status = 'NOT_STARTED' THEN 1 END) as not_started
      FROM achievements a
      JOIN goals g ON a.goal_id = g.id
      WHERE g.cycle_id = $1
      GROUP BY a.quarter
      ORDER BY a.quarter
    `, [cycleId]);

    return result.rows;
  }

  async getDepartmentPerformance(cycleId) {
    const result = await query(`
      SELECT 
        d.id as department_id,
        d.name as department_name,
        COUNT(DISTINCT u.id) as employee_count,
        COUNT(DISTINCT g.id) as goal_count,
        AVG(a.progress_score) as avg_progress
      FROM departments d
      LEFT JOIN users u ON d.id = u.department_id
      LEFT JOIN goals g ON u.id = g.employee_id AND g.cycle_id = $1
      LEFT JOIN achievements a ON g.id = a.goal_id
      WHERE u.role = 'EMPLOYEE' AND u.is_active = true
      GROUP BY d.id, d.name
      ORDER BY avg_progress DESC NULLS LAST
    `, [cycleId]);

    return result.rows;
  }

  async getManagerEffectiveness(cycleId) {
    const result = await query(`
      SELECT 
        m.id as manager_id,
        m.name as manager_name,
        COUNT(DISTINCT u.id) as team_size,
        COUNT(DISTINCT g.id) as total_goals,
        COUNT(DISTINCT CASE WHEN g.status = 'LOCKED' THEN g.id END) as approved_goals,
        COUNT(DISTINCT c.id) as total_checkins,
        AVG(CASE 
          WHEN g.status = 'PENDING_APPROVAL' 
          THEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - g.created_at))
          ELSE NULL 
        END) as avg_approval_time
      FROM users m
      LEFT JOIN users u ON m.id = u.manager_id
      LEFT JOIN goals g ON u.id = g.employee_id AND g.cycle_id = $1
      LEFT JOIN checkins c ON g.id = c.goal_id AND c.manager_id = m.id
      WHERE m.role = 'MANAGER' AND m.is_active = true
      GROUP BY m.id, m.name
      ORDER BY approved_goals DESC
    `, [cycleId]);

    return result.rows;
  }

  async getTopPerformers(cycleId, limit = 10) {
    const result = await query(`
      SELECT 
        u.id as employee_id,
        u.name as employee_name,
        u.email,
        d.name as department_name,
        AVG(a.progress_score) as avg_score,
        COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END) as completed_goals
      FROM users u
      JOIN goals g ON u.id = g.employee_id
      JOIN achievements a ON g.id = a.goal_id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE g.cycle_id = $1 AND g.is_locked = true
      GROUP BY u.id, u.name, u.email, d.name
      ORDER BY avg_score DESC, completed_goals DESC
      LIMIT $2
    `, [cycleId, limit]);

    return result.rows;
  }

  async getQoQTrends(employeeId) {
    const result = await query(`
      SELECT 
        c.name as cycle_name,
        c.start_date,
        a.quarter,
        AVG(a.progress_score) as avg_score
      FROM achievements a
      JOIN goals g ON a.goal_id = g.id
      JOIN cycles c ON g.cycle_id = c.id
      WHERE g.employee_id = $1
      GROUP BY c.id, c.name, c.start_date, a.quarter
      ORDER BY c.start_date, a.quarter
    `, [employeeId]);

    return result.rows;
  }

  async getSystemStats() {
    const result = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'EMPLOYEE' AND is_active = true) as total_employees,
        (SELECT COUNT(*) FROM users WHERE role = 'MANAGER' AND is_active = true) as total_managers,
        (SELECT COUNT(*) FROM cycles WHERE is_active = true) as active_cycles,
        (SELECT COUNT(*) FROM goals) as total_goals,
        (SELECT COUNT(*) FROM goals WHERE is_locked = true) as locked_goals,
        (SELECT COUNT(*) FROM achievements) as total_achievements,
        (SELECT COUNT(*) FROM checkins) as total_checkins
    `);

    return result.rows[0];
  }
}

module.exports = new AnalyticsService();