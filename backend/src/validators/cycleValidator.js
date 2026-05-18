const Joi = require('joi');

const cycleSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).required(),
  q1_start: Joi.date().required(),
  q1_end: Joi.date().min(Joi.ref('q1_start')).required(),
  q2_start: Joi.date().required(),
  q2_end: Joi.date().min(Joi.ref('q2_start')).required(),
  q3_start: Joi.date().required(),
  q3_end: Joi.date().min(Joi.ref('q3_start')).required(),
  q4_start: Joi.date().required(),
  q4_end: Joi.date().min(Joi.ref('q4_start')).required(),
});

const validateCycle = (req, res, next) => {
  const { error } = cycleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => d.message)
    });
  }
  next();
};

module.exports = { validateCycle };