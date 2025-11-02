import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

function TweetCard({ tweet, onUpdate, onDelete, onLike }) {
  const { user } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [likesCount, setLikesCount] = useState(tweet.likesCount || 0);

  const isOwner = user?._id === tweet.owner?._id;

  const handleEdit = () => {
    if (editContent.trim() && editContent !== tweet.content) {
      onUpdate(tweet._id, editContent);
    }
    setIsEditing(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    if (onLike) onLike(tweet._id);
  };

  return (
    <div className="card p-6 hover:bg-dark-tertiary/50 transition-colors">
      <div className="flex space-x-4">
        {/* Avatar */}
        <Link
          to={`/channel/${tweet.owner?.username}`}
          className="flex-shrink-0"
        >
          <img
            src={tweet.owner?.avatar || '/default-avatar.png'}
            alt={tweet.owner?.username}
            className="w-12 h-12 rounded-full border-2 border-dark-border hover:border-neon-purple transition-colors"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <Link
                to={`/channel/${tweet.owner?.username}`}
                className="hover:underline"
              >
                <h3 className="font-semibold text-white truncate">
                  {tweet.owner?.fullName}
                </h3>
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>@{tweet.owner?.username}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
                </span>
                {tweet.updatedAt !== tweet.createdAt && (
                  <>
                    <span>•</span>
                    <span className="text-gray-500 text-xs">edited</span>
                  </>
                )}
              </div>
            </div>

            {/* Menu */}
            {isOwner && (
              <div className="relative ml-2">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-dark-tertiary rounded-lg transition-colors"
                >
                  <FiMoreVertical className="w-4 h-4 text-gray-400" />
                </button>

                {showMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-40 card shadow-xl z-20">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-dark-tertiary text-left transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        <span>Edit Tweet</span>
                      </button>
                      <button
                        onClick={() => {
                          onDelete(tweet._id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-dark-tertiary text-red-400 text-left transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete Tweet</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Tweet Content */}
          {isEditing ? (
            <div className="space-y-3 mb-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="input min-h-[100px] resize-none"
                maxLength={280}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {editContent.length}/280
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    disabled={!editContent.trim() || editContent === tweet.content}
                    className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(tweet.content);
                    }}
                    className="btn-secondary text-sm py-1.5 px-4"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-200 mb-4 whitespace-pre-wrap break-words">
              {tweet.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 group transition-colors ${
                isLiked
                  ? 'text-neon-pink'
                  : 'text-gray-400 hover:text-neon-pink'
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                isLiked ? 'bg-neon-pink/10' : 'group-hover:bg-neon-pink/10'
              }`}>
                <FiHeart
                  className={`w-5 h-5 transition-all ${
                    isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'
                  }`}
                />
              </div>
              {likesCount > 0 && (
                <span className="text-sm font-medium">{likesCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TweetCard;
