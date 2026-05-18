const { query } = require('../config/database');

class Department {
  static async create(name, description = '') {
    const result = await query(
      'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await query('SELECT * FROM departments ORDER BY name');
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM departments WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name) {
      fields.push(`name = $${paramCount}`);
      values.push(updates.name);
      paramCount++;
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(updates.description);
      paramCount++;
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE departments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    await query('DELETE FROM departments WHERE id = $1', [id]);
  }
}

module.exports = Department;