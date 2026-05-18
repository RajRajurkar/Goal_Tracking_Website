import { useState, useEffect } from 'react';
import { Heart, TrendingUp, Calendar, Award } from 'lucide-react';
import axios from '../../api/axiosConfig';
import clsx from 'clsx';

const GoalHealthScore = ({ goalId, goalTitle }) => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthScore();
  }, [goalId]);

  const fetchHealthScore = async () => {
    try {
      const response = await axios.get(`/ai/health/${goalId}`);
      setHealth(response.data);
    } catch (error) {
      console.error('Failed to fetch health score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-24" />
    );
  }

  if (!health) return null;

  const getColor = (score) => {
    if (score >= 80) return { bg: 'bg-success-100', text: 'text-success-700', ring: 'bg-success-500' };
    if (score >= 60) return { bg: 'bg-warning-100', text: 'text-warning-700', ring: 'bg-warning-500' };
    return { bg: 'bg-danger-100', text: 'text-danger-700', ring: 'bg-danger-500' };
  };

  const colors = getColor(health.score);

  return (
    <div className={clsx('rounded-lg p-4 border', colors.bg)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart size={16} className={colors.text} />
          <span className="text-sm font-medium text-gray-700">Goal Health</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx('text-2xl font-bold', colors.text)}>
            {health.score}
          </span>
          <span className={clsx('text-xs px-2 py-0.5 rounded-full text-white', colors.ring)}>
            {health.label}
          </span>
        </div>
      </div>

      {/* Health breakdown */}
      <div className="space-y-2">
        {health.breakdown.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{item.factor}</span>
                <span>{item.score}/{item.max}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all',
                    item.status === 'good' || item.status === 'improving' ? 'bg-success-500' :
                    item.status === 'missing' || item.status === 'no_data' ? 'bg-gray-300' :
                    item.score >= 15 ? 'bg-warning-500' : 'bg-danger-500'
                  )}
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalHealthScore;