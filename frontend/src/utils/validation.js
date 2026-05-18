export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateWeightage = (weightage) => {
  const num = parseInt(weightage);
  return !isNaN(num) && num >= 10 && num <= 100;
};

export const validateGoalForm = (formData) => {
  const errors = {};

  if (!formData.title?.trim()) {
    errors.title = 'Goal title is required';
  }

  if (!formData.thrust_area) {
    errors.thrust_area = 'Thrust area is required';
  }

  if (!formData.uom_type) {
    errors.uom_type = 'Unit of measurement is required';
  }

  if (!formData.target) {
    errors.target = 'Target is required';
  }

  if (!validateWeightage(formData.weightage)) {
    errors.weightage = 'Weightage must be between 10 and 100';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};