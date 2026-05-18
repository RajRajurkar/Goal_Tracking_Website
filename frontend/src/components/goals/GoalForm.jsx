import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import GoalSuggestions from '../ai/GoalSuggestions';
import { THRUST_AREAS } from '../../utils/constants';

const GoalForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thrust_area: '',
    uom_type: '',
    target: '',
    weightage: 10,
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // AI suggestion applied
  const handleApplySuggestion = (suggestion) => {
    setFormData(prev => ({ ...prev, ...suggestion }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Goal title is required';
    if (!formData.thrust_area) newErrors.thrust_area = 'Thrust area is required';
    if (!formData.uom_type) newErrors.uom_type = 'Unit of measurement is required';
    if (!formData.target) newErrors.target = 'Target is required';
    if (!formData.weightage || formData.weightage < 10) newErrors.weightage = 'Minimum weightage is 10%';
    if (formData.weightage > 100) newErrors.weightage = 'Maximum weightage is 100%';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const uomOptions = [
    { value: 'MIN', label: 'MIN - Higher is Better (Revenue, Sales)' },
    { value: 'MAX', label: 'MAX - Lower is Better (Cost, TAT)' },
    { value: 'TIMELINE', label: 'TIMELINE - Date-based completion' },
    { value: 'ZERO', label: 'ZERO - Zero is Success (Incidents)' },
  ];

  const thrustAreaOptions = THRUST_AREAS.map(area => ({
    value: area,
    label: area,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title with AI */}
      <div>
        <Input
          label="Goal Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
          placeholder="e.g., Increase Sales Revenue by 20% in FY 2025"
        />

        {/* AI Suggestions Box */}
        <GoalSuggestions
          title={formData.title}
          thrustArea={formData.thrust_area}
          onApplySuggestion={handleApplySuggestion}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Describe your goal in detail..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Thrust Area"
          name="thrust_area"
          value={formData.thrust_area}
          onChange={handleChange}
          options={thrustAreaOptions}
          error={errors.thrust_area}
          required
        />

        <Select
          label="Unit of Measurement (UoM)"
          name="uom_type"
          value={formData.uom_type}
          onChange={handleChange}
          options={uomOptions}
          error={errors.uom_type}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={formData.uom_type === 'TIMELINE' ? 'Target Date' : 'Target Value'}
          name="target"
          type={formData.uom_type === 'TIMELINE' ? 'date' : 'text'}
          value={formData.target}
          onChange={handleChange}
          error={errors.target}
          required
          placeholder={formData.uom_type === 'TIMELINE' ? '' : 'e.g., 1200000'}
        />

        <div>
          <Input
            label="Weightage (%)"
            name="weightage"
            type="number"
            min="10"
            max="100"
            value={formData.weightage}
            onChange={handleChange}
            error={errors.weightage}
            required
            helperText="Min: 10%, Total must equal 100%"
          />
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${formData.weightage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Goal' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
};

export default GoalForm;