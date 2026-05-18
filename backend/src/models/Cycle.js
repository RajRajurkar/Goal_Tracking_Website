const { query } = require('../config/database');

class Cycle {
  static async create(cycleData) {
    const {
      name,
      start_date,
      end_date,
      q1_start,
      q1_end,
      q2_start,
      q2_end,
      q3_start,
      q3_end,
      q4_start,
      q4_end
    } = cycleData;

    const result = await query(
      `INSERT INTO cycles 
       (name, start_date, end_date, q1_start, q1_end, q2_start, q2_end, q3_start, q3_end, q4_start, q4_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, start_date, end_date, q1_start, q1_end, q2_start, q2_end, q3_start, q3_end, q4_start, q4_end]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM cycles WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query(
      'SELECT * FROM cycles ORDER BY start_date DESC'
    );
    return result.rows;
  }

  static async findActive() {
    const result = await query(
      'SELECT * FROM cycles WHERE is_active = true LIMIT 1'
    );
    return result.rows[0];
  }

  static async update(id, updates) {
    const allowedFields = [
      'name', 'start_date', 'end_date',
      'q1_start', 'q1_end', 'q2_start', 'q2_end',
      'q3_start', 'q3_end', 'q4_start', 'q4_end'
    ];
    
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
      `UPDATE cycles SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async setActive(id) {
    // Deactivate all cycles first
    await query('UPDATE cycles SET is_active = false');
    
    // Activate the specified cycle
    const result = await query(
      'UPDATE cycles SET is_active = true WHERE id = $1 RETURNING *',
      [id]
    );
    
    return result.rows[0];
  }

  static async getCurrentQuarter(cycleId = null) {
    let cycle;
    
    if (cycleId) {
      cycle = await this.findById(cycleId);
    } else {
      cycle = await this.findActive();
    }

    if (!cycle) return null;

    const now = new Date();
    
    if (now >= new Date(cycle.q1_start) && now <= new Date(cycle.q1_end)) {
      return { quarter: 'Q1', start: cycle.q1_start, end: cycle.q1_end };
    } else if (now >= new Date(cycle.q2_start) && now <= new Date(cycle.q2_end)) {
      return { quarter: 'Q2', start: cycle.q2_start, end: cycle.q2_end };
    } else if (now >= new Date(cycle.q3_start) && now <= new Date(cycle.q3_end)) {
      return { quarter: 'Q3', start: cycle.q3_start, end: cycle.q3_end };
    } else if (now >= new Date(cycle.q4_start) && now <= new Date(cycle.q4_end)) {
      return { quarter: 'Q4', start: cycle.q4_start, end: cycle.q4_end };
    }
    
    return null;
  }
}

module.exports = Cycle;