import clsx from 'clsx';

const ProgressBar = ({ value, max = 100, color = 'primary', showLabel = true, size = 'md' }) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    danger: 'bg-danger-600',
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={clsx('h-full transition-all duration-300 rounded-full', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;