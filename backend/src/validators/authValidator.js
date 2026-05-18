const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(255).required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'EMPLOYEE').required(),
  department_id: Joi.number().integer().optional(),
  manager_id: Joi.number().integer().optional(),
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(6).required(),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => d.message)
    });
  }
  next();
};

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => d.message)
    });
  }
  next();
};

const validateChangePassword = (req, res, next) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => d.message)
    });
  }
  next();
};

module.exports = { validateLogin, validateRegister, validateChangePassword };