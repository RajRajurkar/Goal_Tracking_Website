import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';

const AchievementInput = ({ goal, quarter, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    quarter: quarter || '',
    planned_target: goal.target,
    actual_achievement: '',
    status: 'ON_TRACK',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.actual_achievement) {
      toast.error('Please enter actual achievement');
      return;
    }
    onSubmit(formData);
  };

  const statusOptions = [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'ON_TRACK', label: 'On Track' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'AT_RISK', label: 'At Risk' },
  ];

  return (
    <Card title={goal.title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Thrust Area</p>
            <p className="font-medium">{goal.thrust_area}</p>
          </div>
          <div>
            <p className="text-gray-500">UoM Type</p>
            <p className="font-medium">{goal.uom_type}</p>
          </div>
          <div>
            <p className="text-gray-500">Target</p>
            <p className="font-medium">{goal.target}</p>
          </div>
          <div>
            <p className="text-gray-500">Weightage</p>
            <p className="font-medium">{goal.weightage}%</p>
          </div>
        </div>

        <Input
          label={goal.uom_type === 'TIMELINE' ? 'Actual Completion Date' : 'Actual Achievement'}
          name="actual_achievement"
          type={goal.uom_type === 'TIMELINE' ? 'date' : 'text'}
          value={formData.actual_achievement}
          onChange={handleChange}
          required
          placeholder={goal.uom_type === 'TIMELINE' ? '' : 'Enter actual value'}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Add any notes or comments..."
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Update Achievement
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AchievementInput;