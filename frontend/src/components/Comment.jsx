import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { updateComment, deleteComment, toggleCommentLike } from '../services/api';

function Comment({ comment, onUpdate, onDelete }) {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);

  const handleEdit = async () => {
    try {
      await updateComment(comment._id, editContent);
      onUpdate(comment._id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment._id);
      onDelete(comment._id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLike = async () => {
    try {
      await toggleCommentLike(comment._id);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const isOwner = user?._id === comment.owner?._id;

  return (
    <div className="flex space-x-3 p-4 rounded-lg hover:bg-[var(--color-dark-tertiary)] transition-colors">
      {/* Avatar */}
      <img
        src={comment.owner?.avatar || '/default-avatar.png'}
        alt={comment.owner?.username}
        className="w-10 h-10 rounded-full flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">
              {comment.owner?.username}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-[var(--color-dark-border)] rounded-lg transition-colors"
              >
                <FiMoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-36 card shadow-xl z-10">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[var(--color-dark-tertiary)] text-left"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[var(--color-dark-tertiary)] text-red-400 text-left"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Text */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="input min-h-[80px] resize-none"
            />
            <div className="flex space-x-2">
              <button onClick={handleEdit} className="btn-primary text-sm py-1.5">
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary text-sm py-1.5"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 mb-2">{comment.content}</p>
        )}

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 text-sm transition-colors ${
            isLiked
              ? 'text-[var(--color-neon-pink)]'
              : 'text-gray-400 hover:text-[var(--color-neon-pink)]'
          }`}
        >
          <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount > 0 && likesCount}</span>
        </button>
      </div>
    </div>
  );
}

export default Comment;
