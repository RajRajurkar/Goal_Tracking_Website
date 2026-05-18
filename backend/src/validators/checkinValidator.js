const Joi = require('joi');

const achievementSchema = Joi.object({
  quarter: Joi.string().valid('Q1', 'Q2', 'Q3', 'Q4').required(),
  planned_target: Joi.string().optional(),
  actual_achievement: Joi.string().required(),
  status: Joi.string().valid('NOT_STARTED', 'ON_TRACK', 'COMPLETED', 'AT_RISK').optional(),
  notes: Joi.string().max(1000).allow('').optional(),
});

const checkinSchema = Joi.object({
  quarter: Joi.string().valid('Q1', 'Q2', 'Q3', 'Q4').required(),
  comment: Joi.string().min(10).max(2000).required(),
});

const validateAchievement = (req, res, next) => {
  const { error } = achievementSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => d.message)
    });
  }
  next();
};

const validateCheckIn = (req, res, next) => {
  const { error } = checkinSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => d.message)
    });
  }
  next();
};

module.exports = { validateAchievement, validateCheckIn };