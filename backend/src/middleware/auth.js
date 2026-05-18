const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { UnauthorizedError } = require('../utils/errorTypes');
const { query } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const result = await query(
      'SELECT id, email, name, role, department_id, manager_id FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    next(new UnauthorizedError(error.message));
  }
};

module.exports = { authenticate };