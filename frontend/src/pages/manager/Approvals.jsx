import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import ApprovalCard from '../../components/approvals/ApprovalCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { approvalApi } from '../../api/approvalApi';
import toast from 'react-hot-toast';

const Approvals = () => {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const response = await approvalApi.getPendingApprovals();
      setApprovals(response.data);
    } catch (error) {
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (goalId, comment, edits) => {
    try {
      await approvalApi.approveGoal(goalId, { comment, edits });
      toast.success('Goal approved successfully');
      loadApprovals();
    } catch (error) {
      toast.error(error.message || 'Failed to approve goal');
    }
  };

  const handleReject = async (goalId, comment) => {
    try {
      await approvalApi.rejectGoal(goalId, comment);
      toast.success('Goal rejected');
      loadApprovals();
    } catch (error) {
      toast.error(error.message || 'Failed to reject goal');
    }
  };

  const handleReturn = async (goalId, comment) => {
    try {
      await approvalApi.returnForRework(goalId, comment);
      toast.success('Goal returned for rework');
      loadApprovals();
    } catch (error) {
      toast.error(error.message || 'Failed to return goal');
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve team member goals</p>
        </div>

        {approvals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No pending approvals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {approvals.map((goal) => (
              <ApprovalCard
                key={goal.id}
                goal={goal}
                onApprove={handleApprove}
                onReject={handleReject}
                onReturn={handleReturn}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Approvals;