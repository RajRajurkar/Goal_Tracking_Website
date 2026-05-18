const { logger } = require('../utils/logger');
const { AppError } = require('../utils/errorTypes');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err.stack);

  // Mongoose/PostgreSQL duplicate key
  if (err.code === '23505') {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose/PostgreSQL validation error
  if (err.code === '23502') {
    const message = 'Required field missing';
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };