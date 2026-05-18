import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { goalApi } from '../../api/goalApi';
import { cycleApi } from '../../api/cycleApi';
import { checkinApi } from '../../api/checkinApi';
import { Target, CheckSquare, TrendingUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ProgressPredictor from '../../components/dashboard/ProgressPredictor';
const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeCycle, setActiveCycle] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load active cycle
      const cycleResponse = await cycleApi.getActiveCycle();
      setActiveCycle(cycleResponse.data);

      // Load current quarter
      const quarterResponse = await cycleApi.getCurrentQuarter(cycleResponse.data.id);
      setCurrentQuarter(quarterResponse.data);

      // Load goals
      const goalsResponse = await goalApi.getMyGoals(cycleResponse.data.id);
      const goalsData = goalsResponse.data;
      setGoals(goalsData);

      // Calculate stats
      const stats = {
        total: goalsData.length,
        draft: goalsData.filter(g => g.status === 'DRAFT').length,
        pending: goalsData.filter(g => g.status === 'PENDING_APPROVAL').length,
        approved: goalsData.filter(g => g.is_locked).length,
        rejected: goalsData.filter(g => g.status === 'REJECTED').length,
      };
      setStats(stats);

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const totalWeightage = goals.reduce((sum, goal) => sum + parseInt(goal.weightage || 0), 0);

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your goal overview</p>
          </div>
          <Button onClick={() => navigate('/employee/create-goal')}>
            <Target className="mr-2" size={20} />
            Create New Goal
          </Button>
        </div>

        {/* Cycle Info */}
        {activeCycle && (
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{activeCycle.name}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(activeCycle.start_date).toLocaleDateString()} - {new Date(activeCycle.end_date).toLocaleDateString()}
                </p>
              </div>
              {currentQuarter && (
                <Badge variant="primary" size="lg">
                  Current: {currentQuarter.quarter}
                </Badge>
              )}
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Goals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Target className="text-primary-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">Maximum: 8 goals</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved Goals</p>
                <p className="text-3xl font-bold text-success-600 mt-1">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <CheckSquare className="text-success-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={stats.approved} max={stats.total} showLabel={false} color="success" size="sm" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Approval</p>
                <p className="text-3xl font-bold text-warning-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-warning-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Weightage</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalWeightage}%</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-primary-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={totalWeightage} max={100} showLabel={false} size="sm" />
            </div>
          </Card>
        </div>

        {/* Alerts */}
        {stats.draft > 0 && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="text-warning-600 mt-0.5 mr-3" size={20} />
              <div>
                <h4 className="font-medium text-warning-900">Action Required</h4>
                <p className="text-sm text-warning-700 mt-1">
                  You have {stats.draft} draft goal(s). Submit them for approval to get started.
                </p>
              </div>
            </div>
          </div>
        )}

        {totalWeightage !== 100 && stats.total > 0 && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="text-warning-600 mt-0.5 mr-3" size={20} />
              <div>
                <h4 className="font-medium text-warning-900">Weightage Mismatch</h4>
                <p className="text-sm text-warning-700 mt-1">
                  Your total weightage is {totalWeightage}%. It must equal 100% before submission.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Predictor */}
        {activeCycle && (
          <ProgressPredictor cycleId={activeCycle.id} />
        )}

        {/* Recent Goals */}
        <Card title="Recent Goals" action={
          <Button size="sm" variant="outline" onClick={() => navigate('/employee/goals')}>
            View All
          </Button>
        }>
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Yet</h3>
              <p className="text-gray-600 mb-4">Create your first goal to get started</p>
              <Button onClick={() => navigate('/employee/create-goal')}>
                Create Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 5).map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">{goal.thrust_area}</span>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-gray-600">{goal.weightage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      goal.status === 'LOCKED' ? 'primary' :
                      goal.status === 'APPROVED' ? 'success' :
                      goal.status === 'PENDING_APPROVAL' ? 'warning' :
                      goal.status === 'REJECTED' ? 'danger' : 'default'
                    }>
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/employee/create-goal')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
            >
              <Target className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="font-medium text-gray-900">Create New Goal</p>
              <p className="text-sm text-gray-600 mt-1">Set a new performance goal</p>
            </button>

            <button
              onClick={() => navigate('/employee/checkin')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
            >
              <CheckSquare className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="font-medium text-gray-900">Update Progress</p>
              <p className="text-sm text-gray-600 mt-1">Log quarterly achievements</p>
            </button>

            <button
              onClick={() => navigate('/employee/goals')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
            >
              <TrendingUp className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="font-medium text-gray-900">View All Goals</p>
              <p className="text-sm text-gray-600 mt-1">See your complete goal list</p>
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;