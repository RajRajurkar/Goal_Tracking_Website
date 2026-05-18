const { ForbiddenError } = require('../utils/errorTypes');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };
};

const isManagerOf = async (req, res, next) => {
  const { query } = require('../config/database');
  const employeeId = req.params.employeeId || req.body.employee_id;

  if (!employeeId) {
    return next(new ForbiddenError('Employee ID required'));
  }

  const result = await query(
    'SELECT manager_id FROM users WHERE id = $1',
    [employeeId]
  );

  if (result.rows.length === 0 || result.rows[0].manager_id !== req.user.id) {
    return next(new ForbiddenError('You are not the manager of this employee'));
  }

  next();
};

module.exports = { authorize, isManagerOf };