const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, name, role, department_id, manager_id } = userData;
    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (email, password_hash, name, role, department_id, manager_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, department_id, manager_id, created_at`,
      [email, password_hash, name, role, department_id, manager_id]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT id, email, name, role, department_id, manager_id, is_active, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      `SELECT * FROM users WHERE email = $1 AND is_active = true`,
      [email]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let queryText = `
      SELECT u.id, u.email, u.name, u.role, u.department_id, u.manager_id,
             m.name as manager_name, u.is_active, u.created_at
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.role) {
      queryText += ` AND u.role = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }

    if (filters.department_id) {
      queryText += ` AND u.department_id = $${paramCount}`;
      params.push(filters.department_id);
      paramCount++;
    }

    if (filters.manager_id) {
      queryText += ` AND u.manager_id = $${paramCount}`;
      params.push(filters.manager_id);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      queryText += ` AND u.is_active = $${paramCount}`;
      params.push(filters.is_active);
      paramCount++;
    }

    queryText += ' ORDER BY u.name ASC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async update(id, updates) {
    const allowedFields = ['name', 'role', 'department_id', 'manager_id', 'is_active'];
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
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, name, role, department_id, manager_id, is_active, updated_at`,
      values
    );

    return result.rows[0];
  }

  static async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 10);
    await query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [password_hash, id]
    );
  }

  static async delete(id) {
    await query('UPDATE users SET is_active = false WHERE id = $1', [id]);
  }

  static async getTeamMembers(managerId) {
    const result = await query(
      `SELECT id, email, name, role, department_id, is_active
       FROM users WHERE manager_id = $1 AND is_active = true
       ORDER BY name ASC`,
      [managerId]
    );
    return result.rows;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;