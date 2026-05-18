import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../api/adminApi';
import { cycleApi } from '../../api/cycleApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [activeCycle, setActiveCycle] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [cycles, setCycles] = useState([]);
  const [goalDistribution, setGoalDistribution] = useState([]);
  const [progressTrends, setProgressTrends] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCycle) loadAnalytics();
  }, [selectedCycle]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const cycleResponse = await cycleApi.getActiveCycle();
      setActiveCycle(cycleResponse.data);
      setSelectedCycle(cycleResponse.data.id.toString());

      const allCycles = await cycleApi.getAllCycles();
      setCycles(allCycles.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [distResponse, trendsResponse, performersResponse] = await Promise.all([
        adminApi.getAnalytics(selectedCycle, 'goal_distribution'),
        adminApi.getAnalytics(selectedCycle, 'progress_trends'),
        adminApi.getAnalytics(selectedCycle, 'top_performers'),
      ]);

      setGoalDistribution(distResponse.data);
      setProgressTrends(trendsResponse.data);
      setTopPerformers(performersResponse.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const cycleOptions = cycles.map(c => ({ value: c.id.toString(), label: c.name }));

  if (loading && !selectedCycle) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Performance insights and trends</p>
          </div>
          <div className="w-48">
            <Select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              options={cycleOptions}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goal Distribution by Thrust Area */}
            <Card title="Goals by Thrust Area">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={goalDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="thrust_area" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Quarterly Progress Trends */}
            <Card title="Quarterly Progress Trends">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avg_score" fill="#16a34a" name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Status Distribution */}
            <Card title="Achievement Status Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={progressTrends.map(q => [
                      { name: 'Completed', value: q.completed || 0 },
                      { name: 'On Track', value: q.on_track || 0 },
                      { name: 'At Risk', value: q.at_risk || 0 },
                      { name: 'Not Started', value: q.not_started || 0 },
                    ]).flat()}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {[0, 1, 2, 3].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Performers */}
            <Card title="Top Performers">
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.employee_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{performer.employee_name}</p>
                        <p className="text-sm text-gray-600">{performer.department_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">{parseFloat(performer.avg_score).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{performer.completed_goals} completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;