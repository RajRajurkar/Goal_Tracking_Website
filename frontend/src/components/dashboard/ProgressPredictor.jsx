import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import axios from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';

const ProgressPredictor = ({ cycleId }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cycleId) fetchPredictions();
  }, [cycleId]);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get(`/ai/predict/${user.id}`, {
        params: { cycle_id: cycleId }
      });
      setPredictions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return null;
  }

  const getTrendIcon = (trend) => {
    if (trend > 5) return <TrendingUp size={16} className="text-success-600" />;
    if (trend < -5) return <TrendingDown size={16} className="text-danger-600" />;
    return <Minus size={16} className="text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-white" />
          <h3 className="text-lg font-semibold text-white">AI Performance Predictor</h3>
        </div>
        <p className="text-primary-100 text-sm mt-1">
          Predicted year-end performance based on current trends
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div key={prediction.goal_id} className="border border-gray-200 rounded-lg p-4">
              {/* Goal Title */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1 flex-1">
                  {prediction.goal_title}
                </h4>
                <div className="flex items-center gap-1 ml-2">
                  {getTrendIcon(prediction.trend)}
                  <span className="text-xs text-gray-600">
                    {prediction.trend > 0 ? '+' : ''}{prediction.trend.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Prediction Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Current: {prediction.current_avg}%</span>
                  <span>Predicted: {prediction.predicted_final}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-700"
                    style={{ width: `${Math.min(prediction.predicted_final, 100)}%` }}
                  />
                </div>
              </div>

              {/* Message & Confidence */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">{prediction.message}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  prediction.confidence === 'High' ? 'bg-success-100 text-success-700' :
                  prediction.confidence === 'Medium' ? 'bg-warning-100 text-warning-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {prediction.confidence} confidence
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          * Predictions based on historical performance trends. Actual results may vary.
        </p>
      </div>
    </div>
  );
};

export default ProgressPredictor;