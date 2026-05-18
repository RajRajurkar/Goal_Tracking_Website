import { useState } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import GoalComments from './GoalComments';
import { Edit, Trash2, Send, Lock, Users, MessageSquare } from 'lucide-react';

const GoalCard = ({ goal, onEdit, onDelete, onSubmit, showActions = true }) => {
  const [showComments, setShowComments] = useState(false);

  const getStatusBadge = () => {
    const statusConfig = {
      DRAFT: { variant: 'default', label: 'Draft' },
      PENDING_APPROVAL: { variant: 'warning', label: 'Pending Approval' },
      APPROVED: { variant: 'success', label: 'Approved' },
      LOCKED: { variant: 'primary', label: 'Locked' },
      REJECTED: { variant: 'danger', label: 'Rejected' },
    };

    const config = statusConfig[goal.status] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUoMDisplay = () => {
    const uomLabels = {
      MIN: 'Higher is Better',
      MAX: 'Lower is Better',
      TIMELINE: 'Date-based',
      ZERO: 'Zero is Success',
    };
    return uomLabels[goal.uom_type] || goal.uom_type;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
            {goal.is_shared && (
              <Users size={16} className="text-primary-600" title="Shared Goal" />
            )}
            {goal.is_locked && (
              <Lock size={16} className="text-gray-600" title="Locked" />
            )}
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{goal.description}</p>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Thrust Area</p>
          <p className="font-medium text-gray-900">{goal.thrust_area}</p>
        </div>
        <div>
          <p className="text-gray-500">UoM Type</p>
          <p className="font-medium text-gray-900">{getUoMDisplay()}</p>
        </div>
        <div>
          <p className="text-gray-500">Target</p>
          <p className="font-medium text-gray-900">{goal.target}</p>
        </div>
        <div>
          <p className="text-gray-500">Weightage</p>
          <p className="font-medium text-gray-900">{goal.weightage}%</p>
        </div>
      </div>

      {/* Progress Bar for Weightage */}
      <div className="mb-4">
        <ProgressBar value={goal.weightage} max={100} showLabel={false} size="sm" />
      </div>

      {/* Discussion Toggle */}
      <div className="mb-4">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <MessageSquare size={16} className="mr-1.5" />
          {showComments ? 'Hide Discussion' : 'View Discussion'}
        </button>
      </div>

      {showComments && (
        <div className="mb-4">
          <GoalComments goalId={goal.id} />
        </div>
      )}

      {/* Actions */}
      {showActions && !goal.is_locked && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {goal.status === 'DRAFT' && (
            <>
              <Button size="sm" variant="outline" onClick={() => onEdit(goal)}>
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="success" onClick={() => onSubmit(goal.id)}>
                <Send size={16} className="mr-1" />
                Submit
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(goal.id)}>
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            </>
          )}
          {goal.status === 'REJECTED' && (
            <Button size="sm" variant="outline" onClick={() => onEdit(goal)}>
              <Edit size={16} className="mr-1" />
              Edit & Resubmit
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalCard;