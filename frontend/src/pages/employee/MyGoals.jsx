import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import GoalList from '../../components/goals/GoalList';
import GoalValidation from '../../components/goals/GoalValidation';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import GoalForm from '../../components/goals/GoalForm';
import { goalApi } from '../../api/goalApi';
import { cycleApi } from '../../api/cycleApi';
import toast from 'react-hot-toast';

const MyGoals = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const cycleResponse = await cycleApi.getActiveCycle();
      setActiveCycle(cycleResponse.data);

      const response = await goalApi.getMyGoals(cycleResponse.data.id);
      setGoals(response.data);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowEditModal(true);
  };

  const handleUpdate = async (formData) => {
    try {
      await goalApi.updateGoal(editingGoal.id, formData);
      toast.success('Goal updated successfully');
      setShowEditModal(false);
      setEditingGoal(null);
      loadGoals();
    } catch (error) {
      toast.error(error.message || 'Failed to update goal');
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await goalApi.deleteGoal(goalId);
      toast.success('Goal deleted successfully');
      loadGoals();
    } catch (error) {
      toast.error(error.message || 'Failed to delete goal');
    }
  };

  const handleSubmit = async (goalId) => {
    // Check if total weightage is 100%
    const totalWeightage = goals.reduce((sum, g) => sum + parseInt(g.weightage || 0), 0);
    
    if (totalWeightage !== 100) {
      toast.error('Total weightage must equal 100% before submission');
      return;
    }

    try {
      await goalApi.submitForApproval(goalId);
      toast.success('Goal submitted for approval');
      loadGoals();
    } catch (error) {
      toast.error(error.message || 'Failed to submit goal');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Goals</h1>
            <p className="text-gray-600 mt-1">
              {activeCycle?.name || 'No active cycle'}
            </p>
          </div>
          <Button onClick={() => navigate('/employee/create-goal')}>
            Create New Goal
          </Button>
        </div>

        {/* Validation Card */}
        <GoalValidation goals={goals} />

        {/* Goals List */}
        <GoalList
          goals={goals}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
        />

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingGoal(null);
          }}
          title="Edit Goal"
          size="lg"
        >
          <GoalForm
            initialData={editingGoal}
            onSubmit={handleUpdate}
            onCancel={() => {
              setShowEditModal(false);
              setEditingGoal(null);
            }}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default MyGoals;