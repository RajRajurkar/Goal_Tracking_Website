const Joi = require('joi');

const goalSchema = Joi.object({
  title: Joi.string().min(3).max(500).required(),
  description: Joi.string().max(2000).allow(''),
  thrust_area: Joi.string().required(),
  uom_type: Joi.string().valid('MIN', 'MAX', 'TIMELINE', 'ZERO').required(),
  target: Joi.string().required(),
  weightage: Joi.number().integer().min(10).max(100).required(),
});

const sharedGoalSchema = Joi.object({
  title: Joi.string().min(3).max(500).required(),
  description: Joi.string().max(2000).allow(''),
  thrust_area: Joi.string().required(),
  uom_type: Joi.string().valid('MIN', 'MAX', 'TIMELINE', 'ZERO').required(),
  target: Joi.string().required(),
  employee_ids: Joi.array().items(Joi.number().integer()).min(1).required(),
});

const validateGoal = (req, res, next) => {
  const { error } = goalSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => d.message)
    });
  }
  next();
};

const validateSharedGoal = (req, res, next) => {
  const { error } = sharedGoalSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => d.message)
    });
  }
  next();
};

module.exports = { validateGoal, validateSharedGoal };