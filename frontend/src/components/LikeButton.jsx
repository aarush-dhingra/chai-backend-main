import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiThumbsUp } from 'react-icons/fi';
import { toggleVideoLike } from '../services/api';

function LikeButton({ videoId, initialLikesCount = 0, initialIsLiked = false, variant = 'heart' }) {
  const { user } = useContext(AuthContext);
  const [isLiked, setIsLiked] = useState(initialIsLiked);  // ✅ Use initial value
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  // ✅ Update when props change (on refresh or new video)
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikesCount(initialLikesCount);
  }, [videoId, initialIsLiked, initialLikesCount]);

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like videos');
      return;
    }

    setLoading(true);
    try {
      await toggleVideoLike(videoId);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Failed to like video:', error);
    } finally {
      setLoading(false);
    }
  };

  const Icon = variant === 'heart' ? FiHeart : FiThumbsUp;

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        isLiked
          ? 'bg-[var(--color-neon-pink)] text-white'
          : 'bg-[var(--color-dark-tertiary)] text-gray-300 hover:bg-[var(--color-dark-border)]'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Icon className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likesCount > 0 ? likesCount : 'Like'}</span>
    </button>
  );
}

export default LikeButton;
