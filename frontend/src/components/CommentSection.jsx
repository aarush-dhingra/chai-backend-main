import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Comment from './Comment';
import { getVideoComments, addComment } from '../services/api';
import { FiMessageSquare } from 'react-icons/fi';

function CommentSection({ videoId }) {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await getVideoComments(videoId);
      console.log('Comments API Response:', response);
      
      // Backend structure: { data: { comments: [...], page, limit, total, totalPages } }
      const commentsData = response.data?.comments || [];
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await addComment(videoId, newComment);
      console.log('Add Comment Response:', response);
      
      // Get the new comment from response
      const newCommentData = response.data || response;
      setComments([newCommentData, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = (commentId, newContent) => {
    setComments(
      comments.map((c) =>
        c._id === commentId ? { ...c, content: newContent } : c
      )
    );
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter((c) => c._id !== commentId));
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
        <FiMessageSquare className="w-6 h-6 text-[var(--color-neon-purple)]" />
        <span>{comments.length} Comments</span>
      </h3>

      {/* Add Comment */}
      {user ? (
        <form onSubmit={handleAddComment} className="mb-8">
          <div className="flex space-x-3">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.username}
              className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="input min-h-[80px] resize-none mb-2"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Posting...' : 'Comment'}
                </button>
                {newComment && (
                  <button
                    type="button"
                    onClick={() => setNewComment('')}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-[var(--color-dark-tertiary)] rounded-lg text-center">
          <p className="text-gray-400">Please log in to comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-1">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-[var(--color-neon-purple)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments && Array.isArray(comments) && comments.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}

export default CommentSection;
