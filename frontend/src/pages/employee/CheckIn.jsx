import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import AchievementInput from '../../components/checkins/AchievementInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { goalApi } from '../../api/goalApi';
import { cycleApi } from '../../api/cycleApi';
import { checkinApi } from '../../api/checkinApi';
import { QUARTERS } from '../../utils/constants';
import toast from 'react-hot-toast';

const CheckIn = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeCycle, setActiveCycle] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedQuarter) {
      loadAchievements();
    }
  }, [selectedQuarter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const cycleResponse = await cycleApi.getActiveCycle();
      setActiveCycle(cycleResponse.data);

      const quarterResponse = await cycleApi.getCurrentQuarter(cycleResponse.data.id);
      setCurrentQuarter(quarterResponse.data);
      setSelectedQuarter(quarterResponse.data?.quarter || 'Q1');

      const goalsResponse = await goalApi.getMyGoals(cycleResponse.data.id);
      const lockedGoals = goalsResponse.data.filter(g => g.is_locked);
      setGoals(lockedGoals);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    if (!activeCycle || !selectedQuarter) return;

    try {
      const response = await checkinApi.getMyAchievements(activeCycle.id, selectedQuarter);
      const achievementsMap = {};
      response.data.forEach(achievement => {
        achievementsMap[achievement.goal_id] = achievement;
      });
      setAchievements(achievementsMap);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  };

  const handleUpdateAchievement = async (goalId, formData) => {
    try {
      setSubmitting(true);
      await checkinApi.updateAchievement(goalId, {
        ...formData,
        quarter: selectedQuarter,
      });
      toast.success('Achievement updated successfully');
      loadAchievements();
    } catch (error) {
      toast.error(error.message || 'Failed to update achievement');
    } finally {
      setSubmitting(false);
    }
  };

  const quarterOptions = QUARTERS.map(q => ({
    value: q,
    label: q,
  }));

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
            <h1 className="text-3xl font-bold text-gray-900">Quarterly Check-In</h1>
            <p className="text-gray-600 mt-1">Update your goal achievements</p>
          </div>
          {currentQuarter && (
            <Badge variant="primary" size="lg">
              Current Quarter: {currentQuarter.quarter}
            </Badge>
          )}
        </div>

        {/* Quarter Selector */}
        <Card>
          <div className="max-w-xs">
            <Select
              label="Select Quarter"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              options={quarterOptions}
            />
          </div>
        </Card>

        {/* Goals */}
        {goals.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No approved goals found</p>
              <p className="text-gray-400 text-sm mt-2">Submit goals for approval first</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {goals.map((goal) => (
              <AchievementInput
                key={goal.id}
                goal={goal}
                quarter={selectedQuarter}
                onSubmit={(formData) => handleUpdateAchievement(goal.id, formData)}
                loading={submitting}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckIn;