const Cycle = require('../models/Cycle');
const { transaction } = require('../config/database');
const { NotFoundError } = require('../utils/errorTypes');

class CycleService {
  async setActiveCycle(cycleId) {
    return await transaction(async (client) => {
      // Deactivate all cycles
      await client.query('UPDATE cycles SET is_active = false');

      // Activate the specified cycle
      const result = await client.query(
        'UPDATE cycles SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [cycleId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Cycle not found');
      }

      return result.rows[0];
    });
  }
}

module.exports = new CycleService();