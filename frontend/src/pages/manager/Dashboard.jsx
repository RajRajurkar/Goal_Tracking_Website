import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { approvalApi } from '../../api/approvalApi';
import { goalApi } from '../../api/goalApi';
import { cycleApi } from '../../api/cycleApi';
import { Users, CheckSquare, Target, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import GoalStatusChart from '../../components/dashboard/GoalStatusChart';
import ThrustAreaChart from '../../components/dashboard/ThrustAreaChart';
const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [teamGoals, setTeamGoals] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const cycleResponse = await cycleApi.getActiveCycle();
      setActiveCycle(cycleResponse.data);

      const approvalsResponse = await approvalApi.getPendingApprovals();
      setPendingApprovals(approvalsResponse.data);

      const goalsResponse = await goalApi.getTeamGoals(cycleResponse.data.id);
      setTeamGoals(goalsResponse.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const teamMembers = [...new Set(teamGoals.map(g => g.employee_id))];
  const approvedGoals = teamGoals.filter(g => g.is_locked).length;
  const totalGoals = teamGoals.length;

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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your team's goals and performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Team Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{teamMembers.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="text-primary-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Approvals</p>
                <p className="text-3xl font-bold text-warning-600 mt-1">{pendingApprovals.length}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                <CheckSquare className="text-warning-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Goals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalGoals}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Target className="text-primary-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved Goals</p>
                <p className="text-3xl font-bold text-success-600 mt-1">{approvedGoals}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-success-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Goal Status Distribution">
            <GoalStatusChart goals={teamGoals} />
          </Card>
          
          <Card title="Goals by Thrust Area">
            <ThrustAreaChart goals={teamGoals} />
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card title="Pending Approvals" action={
          <Button size="sm" variant="outline" onClick={() => navigate('/manager/approvals')}>
            View All
          </Button>
        }>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-600">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.slice(0, 5).map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <p className="text-sm text-gray-600">{goal.employee_name}</p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/manager/approvals')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
            >
              <CheckSquare className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="font-medium text-gray-900">Review Approvals</p>
              <p className="text-sm text-gray-600 mt-1">{pendingApprovals.length} pending</p>
            </button>

            <button
              onClick={() => navigate('/manager/team-goals')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
            >
              <Target className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="font-medium text-gray-900">Team Goals</p>
              <p className="text-sm text-gray-600 mt-1">View all team goals</p>
            </button>

            <button
              onClick={() => navigate('/manager/checkins')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
            >
              <TrendingUp className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="font-medium text-gray-900">Check-Ins</p>
              <p className="text-sm text-gray-600 mt-1">Conduct quarterly reviews</p>
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;