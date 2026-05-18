import { useState } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import GoalComments from '../goals/GoalComments';
import { CheckCircle, XCircle, ArrowLeft, User } from 'lucide-react';

const ApprovalCard = ({ goal, onApprove, onReject, onReturn }) => {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [comment, setComment] = useState('');
  const [edits, setEdits] = useState({
    target: goal.target,
    weightage: goal.weightage,
  });

  const handleApprove = () => {
    onApprove(goal.id, comment, edits);
    setShowApproveModal(false);
    setComment('');
  };

  const handleReject = () => {
    if (!comment.trim()) {
      alert('Comment is required for rejection');
      return;
    }
    onReject(goal.id, comment);
    setShowRejectModal(false);
    setComment('');
  };

  const handleReturn = () => {
    if (!comment.trim()) {
      alert('Comment is required');
      return;
    }
    onReturn(goal.id, comment);
    setShowReturnModal(false);
    setComment('');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{goal.title}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <User size={16} className="mr-1" />
              <span>{goal.employee_name}</span>
            </div>
          </div>
          <Badge variant="warning">Pending</Badge>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-gray-500">Thrust Area</p>
            <p className="font-medium text-gray-900">{goal.thrust_area}</p>
          </div>
          <div>
            <p className="text-gray-500">UoM Type</p>
            <p className="font-medium text-gray-900">{goal.uom_type}</p>
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

        {/* Discussion */}
        <div className="mb-6">
          <GoalComments goalId={goal.id} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            onClick={() => setShowApproveModal(true)}
          >
            <CheckCircle size={16} className="mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowRejectModal(true)}
          >
            <XCircle size={16} className="mr-1" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReturnModal(true)}
          >
            <ArrowLeft size={16} className="mr-1" />
            Return
          </Button>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Goal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>Approve</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You can edit the target or weightage before approving, or leave as is.
          </p>

          <Input
            label="Target"
            value={edits.target}
            onChange={(e) => setEdits({ ...edits, target: e.target.value })}
          />

          <Input
            label="Weightage (%)"
            type="number"
            min="10"
            max="100"
            value={edits.weightage}
            onChange={(e) => setEdits({ ...edits, weightage: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Add any feedback..."
            />
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Goal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject}>Reject</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for rejection. This will be sent to the employee.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment <span className="text-danger-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Explain why this goal is being rejected..."
              required
            />
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="Return for Rework"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowReturnModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn}>Return</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This goal will be returned to draft status. The employee can edit and resubmit.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback <span className="text-danger-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Provide feedback on what needs to be changed..."
              required
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ApprovalCard;