import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const GoalValidation = ({ goals }) => {
  const [validation, setValidation] = useState({
    totalWeightage: 0,
    goalCount: 0,
    isValid: false,
    errors: [],
    warnings: [],
  });

  useEffect(() => {
    const totalWeightage = goals.reduce((sum, goal) => sum + parseInt(goal.weightage || 0), 0);
    const goalCount = goals.length;
    const errors = [];
    const warnings = [];

    if (totalWeightage > 100) {
      errors.push(`Total weightage exceeds 100% (Current: ${totalWeightage}%)`);
    } else if (totalWeightage < 100) {
      warnings.push(`Total weightage is ${totalWeightage}%. Need ${100 - totalWeightage}% more`);
    }

    if (goalCount > 8) {
      errors.push(`Maximum 8 goals allowed (Current: ${goalCount})`);
    }

    if (goalCount === 0) {
      warnings.push('No goals created yet');
    }

    goals.forEach((goal, index) => {
      if (goal.weightage < 10) {
        errors.push(`Goal ${index + 1}: Minimum weightage is 10% (Current: ${goal.weightage}%)`);
      }
    });

    const isValid = errors.length === 0 && totalWeightage === 100 && goalCount > 0;

    setValidation({
      totalWeightage,
      goalCount,
      isValid,
      errors,
      warnings,
    });
  }, [goals]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Goal Validation</h3>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Total Weightage</p>
          <p className={`text-2xl font-bold ${validation.totalWeightage === 100 ? 'text-success-600' : 'text-warning-600'}`}>
            {validation.totalWeightage}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Goal Count</p>
          <p className={`text-2xl font-bold ${validation.goalCount <= 8 ? 'text-success-600' : 'text-danger-600'}`}>
            {validation.goalCount} / 8
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              validation.totalWeightage === 100
                ? 'bg-success-600'
                : validation.totalWeightage > 100
                ? 'bg-danger-600'
                : 'bg-warning-600'
            }`}
            style={{ width: `${Math.min(validation.totalWeightage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        {validation.isValid ? (
          <div className="flex items-center text-success-600">
            <CheckCircle size={20} className="mr-2" />
            <span className="font-medium">Ready to submit</span>
          </div>
        ) : (
          <div className="flex items-center text-warning-600">
            <AlertCircle size={20} className="mr-2" />
            <span className="font-medium">Not ready to submit</span>
          </div>
        )}
      </div>

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-danger-600 mb-2">Errors:</p>
          <ul className="space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-start text-sm text-danger-600">
                <XCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div>
          <p className="text-sm font-medium text-warning-600 mb-2">Warnings:</p>
          <ul className="space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index} className="flex items-start text-sm text-warning-600">
                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GoalValidation;