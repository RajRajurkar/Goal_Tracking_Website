const fs = require('fs');
const path = require('path');
const { query, pool } = require('../../config/database');
const { logger } = require('../../utils/logger');

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');

    // Read all migration files in order
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      logger.info(`Running migration: ${file}`);
      await query(sql);
      logger.info(`✅ Migration completed: ${file}`);
    }

    logger.info('✅ All migrations completed successfully');
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

runMigrations();