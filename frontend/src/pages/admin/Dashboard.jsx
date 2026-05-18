import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../api/adminApi';
import { reportApi } from '../../api/reportApi';
import { cycleApi } from '../../api/cycleApi';
import { Users, Target, CheckSquare, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [completionData, setCompletionData] = useState(null);
  const [escalations, setEscalations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const statsResponse = await adminApi.getSystemStats();
      setStats(statsResponse.data);

      try {
        const cycleResponse = await cycleApi.getActiveCycle();
        const completionResponse = await reportApi.getCompletionDashboard(
          cycleResponse.data.id
        );
        setCompletionData(completionResponse.data);
      } catch {
        console.log('No active cycle');
      }

      try {
        const escalationResponse = await adminApi.getEscalations();
        setEscalations(escalationResponse.data);
      } catch {
        setEscalations([]);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System overview and management</p>
          </div>
          <Button onClick={() => navigate('/admin/cycles')}>
            Manage Cycles
          </Button>
        </div>

        {/* System Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_users}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="text-primary-600" size={24} />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Employees: {stats.total_employees} | Managers: {stats.total_managers}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Goals</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_goals}</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                  <Target className="text-success-600" size={24} />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Locked: {stats.locked_goals}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Achievements</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_achievements}</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-warning-600" size={24} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Check-ins</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_checkins}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <CheckSquare className="text-primary-600" size={24} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Completion Dashboard */}
        {completionData && (
          <Card title="Completion Overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {completionData.total_employees}
                </p>
                <p className="text-sm text-gray-600">Total Employees</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">
                  {completionData.employees_with_approved_goals}
                </p>
                <p className="text-sm text-gray-600">Goals Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning-600">
                  {completionData.employees_pending_approval}
                </p>
                <p className="text-sm text-gray-600">Pending Approval</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {completionData.employees_in_draft}
                </p>
                <p className="text-sm text-gray-600">Still in Draft</p>
              </div>
            </div>

            <hr className="my-6" />

            <h4 className="font-medium text-gray-900 mb-4">Quarterly Progress</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-xl font-bold text-primary-600">
                  {completionData.q1_checkins}
                </p>
                <p className="text-sm text-gray-600">Q1 Check-ins</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-primary-600">
                  {completionData.q2_checkins}
                </p>
                <p className="text-sm text-gray-600">Q2 Check-ins</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-primary-600">
                  {completionData.q3_checkins}
                </p>
                <p className="text-sm text-gray-600">Q3 Check-ins</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-primary-600">
                  {completionData.q4_checkins}
                </p>
                <p className="text-sm text-gray-600">Q4 Check-ins</p>
              </div>
            </div>
          </Card>
        )}

        {/* Escalations */}
        <Card title="Active Escalations" action={
          <Button size="sm" variant="outline" onClick={() => navigate('/admin/escalations')}>
            View All
          </Button>
        }>
          {escalations.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-600">No active escalations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {escalations.slice(0, 5).map((esc) => (
                <div key={esc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{esc.rule_type.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-600">{esc.user_name}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(esc.sent_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
            >
              <Users className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="font-medium text-gray-900">Manage Users</p>
            </button>

            <button
              onClick={() => navigate('/admin/cycles')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
            >
              <Target className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="font-medium text-gray-900">Cycle Management</p>
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
            >
              <BarChart3 className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="font-medium text-gray-900">Analytics</p>
            </button>

            <button
              onClick={() => navigate('/admin/reports')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
            >
              <CheckSquare className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="font-medium text-gray-900">Reports</p>
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;