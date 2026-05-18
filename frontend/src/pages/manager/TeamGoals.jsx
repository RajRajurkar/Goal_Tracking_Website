import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { goalApi } from '../../api/goalApi';
import { cycleApi } from '../../api/cycleApi';
import toast from 'react-hot-toast';

const TeamGoals = () => {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);

  useEffect(() => {
    loadTeamGoals();
  }, []);

  const loadTeamGoals = async () => {
    try {
      setLoading(true);
      const cycleResponse = await cycleApi.getActiveCycle();
      setActiveCycle(cycleResponse.data);

      const response = await goalApi.getTeamGoals(cycleResponse.data.id);
      setGoals(response.data);
    } catch (error) {
      toast.error('Failed to load team goals');
    } finally {
      setLoading(false);
    }
  };

  const groupedGoals = goals.reduce((acc, goal) => {
    if (!acc[goal.employee_id]) {
      acc[goal.employee_id] = {
        name: goal.employee_name,
        email: goal.employee_email,
        goals: [],
      };
    }
    acc[goal.employee_id].goals.push(goal);
    return acc;
  }, {});

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
          <h1 className="text-3xl font-bold text-gray-900">Team Goals</h1>
          <p className="text-gray-600 mt-1">
            {activeCycle?.name || ''} - Goals across all team members
          </p>
        </div>

        {Object.entries(groupedGoals).length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">No goals found for your team</p>
            </div>
          </Card>
        ) : (
          Object.entries(groupedGoals).map(([employeeId, data]) => (
            <Card key={employeeId} title={data.name}>
              <p className="text-sm text-gray-600 mb-4">{data.email}</p>
              <div className="space-y-3">
                {data.goals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{goal.thrust_area}</span>
                        <span>•</span>
                        <span>Target: {goal.target}</span>
                        <span>•</span>
                        <span>Weightage: {goal.weightage}%</span>
                      </div>
                    </div>
                    <Badge variant={
                      goal.status === 'LOCKED' ? 'primary' :
                      goal.status === 'APPROVED' ? 'success' :
                      goal.status === 'PENDING_APPROVAL' ? 'warning' :
                      goal.status === 'REJECTED' ? 'danger' : 'default'
                    }>
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default TeamGoals;