const { Pool } = require('pg');
const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  NODE_ENV
} = require('./env');
const { logger } = require('../utils/logger');

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (NODE_ENV === 'development') {
      logger.debug('Query executed', { text, duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    logger.error('Database query error:', { text, error: error.message });
    throw error;
  }
};

const getClient = () => pool.connect();

const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    return result.rows[0];
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

module.exports = {
  query,
  pool,
  getClient,
  transaction,
  testConnection
};