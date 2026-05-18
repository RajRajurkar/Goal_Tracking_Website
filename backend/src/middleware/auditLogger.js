const { query } = require('../config/database');
const { logger } = require('../utils/logger');

const auditLogger = (entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log successful changes
        logAudit(req, entityType).catch(err => logger.error('Audit log failed:', err));
      }
      return originalJson(data);
    };

    next();
  };
};

const logAudit = async (req, entityType) => {
  try {
    const userId = req.user?.id;
    const action = req.method;
    const entityId = req.params.id || req.body?.id;
    const changes = {
      method: req.method,
      path: req.path,
      body: req.body,
      params: req.params
    };

    await query(
      `INSERT INTO audit_logs (user_id, entity_type, entity_id, action, changes, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, entityType, entityId, action, JSON.stringify(changes), req.ip]
    );
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
};

module.exports = { auditLogger };