import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import axios from '../../api/axiosConfig';
import Badge from '../common/Badge';
import clsx from 'clsx';

const GoalSuggestions = ({ title, thrustArea, onApplySuggestion }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [smartScore, setSmartScore] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (title && title.length > 5) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions();
      }, 800);
      return () => clearTimeout(debounceTimer);
    }
  }, [title, thrustArea]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/ai/goal-suggestions', {
        title,
        thrust_area: thrustArea
      });
      setSuggestions(response.data);

      const smartSuggestion = response.data.find(s => s.type === 'smart_check');
      if (smartSuggestion) {
        setSmartScore(smartSuggestion);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!title || title.length < 5) return null;

  return (
    <div className="mt-3 border border-primary-200 rounded-lg overflow-hidden bg-primary-50">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-primary-600 text-white"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} />
          <span className="font-medium text-sm">AI Assistant</span>
          {loading && <span className="text-xs opacity-75">Analyzing...</span>}
        </div>
        {smartScore && (
          <div className="flex items-center gap-2">
            <span className="text-xs">SMART Score:</span>
            <span className={clsx(
              'font-bold text-sm px-2 py-0.5 rounded-full',
              smartScore.score >= 80 ? 'bg-success-500' :
              smartScore.score >= 60 ? 'bg-warning-500' : 'bg-danger-500'
            )}>
              {smartScore.score}/100
            </span>
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {suggestions.map((suggestion, index) => {
            if (suggestion.type === 'uom_suggestion') {
              return (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={16} className="text-warning-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">Recommended Settings</h4>
                  </div>

                  <div className="space-y-3">
                    {/* UoM Recommendation */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-xs text-gray-500">Recommended UoM</p>
                        <p className="font-medium text-sm">{suggestion.recommended_uom}</p>
                        <p className="text-xs text-gray-500">{suggestion.explanation}</p>
                      </div>
                      <button
                        onClick={() => onApplySuggestion({ uom_type: suggestion.recommended_uom })}
                        className="text-xs bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Target Suggestions */}
                    {suggestion.target_suggestions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Target Options:</p>
                        <div className="flex gap-2 flex-wrap">
                          {suggestion.target_suggestions.map((ts, i) => (
                            <button
                              key={i}
                              onClick={() => onApplySuggestion({ target: ts.target })}
                              className="text-xs border border-primary-300 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
                              title={ts.description}
                            >
                              {ts.target || 'Set Date'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Improved Title */}
                    {suggestion.smarter_title && suggestion.smarter_title !== title && (
                      <div className="p-2 bg-success-50 rounded border border-success-200">
                        <p className="text-xs text-gray-500 mb-1">Suggested improvement:</p>
                        <p className="text-sm text-gray-800 italic">"{suggestion.smarter_title}"</p>
                        <button
                          onClick={() => onApplySuggestion({ title: suggestion.smarter_title })}
                          className="mt-2 text-xs bg-success-600 text-white px-3 py-1 rounded-md hover:bg-success-700"
                        >
                          Use This Title
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (suggestion.type === 'smart_check') {
              return (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-success-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">SMART Criteria Check</h4>
                  </div>

                  <div className="space-y-2">
                    {suggestion.feedback.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle size={14} className="text-success-600 flex-shrink-0" />
                        ) : (
                          <XCircle size={14} className="text-danger-500 flex-shrink-0" />
                        )}
                        <div>
                          <span className="text-xs font-medium">{item.criterion}: </span>
                          <span className="text-xs text-gray-600">{item.note}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {suggestion.improvements.length > 0 && (
                    <div className="mt-3 p-2 bg-warning-50 rounded">
                      <p className="text-xs font-medium text-warning-700 mb-1">Improvements:</p>
                      <ul className="space-y-1">
                        {suggestion.improvements.map((imp, i) => (
                          <li key={i} className="text-xs text-warning-600">• {imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            }

            if (suggestion.type === 'weightage_suggestion') {
              return (
                <div key={index} className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Recommended Weightage</p>
                      <p className="font-medium text-sm">{suggestion.recommended_weightage}%</p>
                    </div>
                    <button
                      onClick={() => onApplySuggestion({ weightage: suggestion.recommended_weightage })}
                      className="text-xs bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default GoalSuggestions;