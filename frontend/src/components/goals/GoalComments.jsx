import { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import axios from '../../api/axiosConfig';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const GoalComments = ({ goalId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (goalId) {
      fetchComments();
    }
  }, [goalId]);

  const fetchComments = async () => {
    try {
      const data = await axios.get(`/comments/${goalId}`);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const data = await axios.post(`/comments/${goalId}`, { content: newComment });
      setComments([...comments, data]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col h-full max-h-96">
      <h3 className="font-semibold text-gray-900 mb-4">Discussion Thread</h3>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No comments yet. Start the conversation!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                {comment.user_name?.charAt(0) || <User size={16} />}
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex-1 border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900 text-sm">{comment.user_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-auto flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          disabled={submitting}
        />
        <Button type="submit" size="sm" loading={submitting} disabled={!newComment.trim()}>
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
};

export default GoalComments;
