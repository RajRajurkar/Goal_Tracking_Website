import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ThrustAreaChart = ({ goals }) => {
  if (!goals || goals.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No goal data available
      </div>
    );
  }

  const areas = {};
  goals.forEach(goal => {
    if (goal.thrust_area) {
      areas[goal.thrust_area] = (areas[goal.thrust_area] || 0) + 1;
    }
  });

  const data = Object.keys(areas).map(key => ({
    name: key,
    count: areas[key]
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            angle={-45} 
            textAnchor="end"
            height={60}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#3b82f6" /> // primary-500
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ThrustAreaChart;
