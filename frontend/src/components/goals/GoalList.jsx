import GoalCard from './GoalCard';
import LoadingSpinner from '../common/LoadingSpinner';

const GoalList = ({ goals, loading, onEdit, onDelete, onSubmit, showActions = true }) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No goals found</p>
        <p className="text-gray-400 text-sm mt-2">Create your first goal to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={onEdit}
          onDelete={onDelete}
          onSubmit={onSubmit}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default GoalList;