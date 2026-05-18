import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const GoalStatusChart = ({ goals }) => {
  if (!goals || goals.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No goal data available
      </div>
    );
  }

  const statuses = {
    DRAFT: 0,
    PENDING_APPROVAL: 0,
    APPROVED: 0,
    REJECTED: 0,
    LOCKED: 0
  };

  goals.forEach(goal => {
    statuses[goal.status] = (statuses[goal.status] || 0) + 1;
  });

  const data = [
    { name: 'Draft', value: statuses.DRAFT, color: '#9ca3af' }, // gray-400
    { name: 'Pending', value: statuses.PENDING_APPROVAL, color: '#f59e0b' }, // warning-500
    { name: 'Approved', value: statuses.APPROVED + statuses.LOCKED, color: '#10b981' }, // success-500
    { name: 'Rejected', value: statuses.REJECTED, color: '#ef4444' } // danger-500
  ].filter(item => item.value > 0);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} Goals`, 'Count']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GoalStatusChart;
