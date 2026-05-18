import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import GoalForm from '../../components/goals/GoalForm';
import { goalApi } from '../../api/goalApi';
import { cycleApi } from '../../api/cycleApi';
import toast from 'react-hot-toast';

const CreateGoal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeCycle, setActiveCycle] = useState(null);

  useEffect(() => {
    loadActiveCycle();
  }, []);

  const loadActiveCycle = async () => {
    try {
      const response = await cycleApi.getActiveCycle();
      setActiveCycle(response.data);
    } catch (error) {
      toast.error('No active cycle found');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await goalApi.createGoal(formData);
      toast.success('Goal created successfully');
      navigate('/employee/goals');
    } catch (error) {
      toast.error(error.message || 'Failed to create goal');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Goal</h1>
          <p className="text-gray-600 mt-1">
            {activeCycle ? `Cycle: ${activeCycle.name}` : 'No active cycle'}
          </p>
        </div>

        {/* Form */}
        <Card>
          <GoalForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/employee/goals')}
            loading={loading}
          />
        </Card>

        {/* Guidelines */}
        <Card title="Goal Setting Guidelines">
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Minimum weightage per goal: 10%</li>
                <li>Total weightage must equal 100%</li>
                <li>Maximum 8 goals per cycle</li>
                <li>Goals must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Unit of Measurement Types:</h4>
              <ul className="space-y-2">
                <li><strong>MIN:</strong> Higher values are better (e.g., Revenue, Sales)</li>
                <li><strong>MAX:</strong> Lower values are better (e.g., TAT, Cost)</li>
                <li><strong>TIMELINE:</strong> Date-based completion targets</li>
                <li><strong>ZERO:</strong> Zero is success (e.g., Safety incidents)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateGoal;