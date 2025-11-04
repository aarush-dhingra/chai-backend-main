import { Link } from 'react-router-dom';
import { FiPlay, FiEye } from 'react-icons/fi';

// ✅ Format video duration to MM:SS
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ✅ Helper function for time formatting
const formatTimeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
};

function VideoCard({ video }) {
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  return (
    <Link to={`/video/${video._id}`} className="group">
      <div className="card card-hover">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 right-4">
              <div className="w-12 h-12 bg-neon-purple rounded-full flex items-center justify-center">
                <FiPlay className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          {/* ✅ Updated to use formatDuration */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-dark-primary/90 rounded text-xs font-semibold">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-neon-purple transition-colors">
            {video.title}
          </h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
            <img
              src={video.owner?.avatar}
              alt={video.owner?.username}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="hover:text-white transition-colors">
              {video.owner?.username}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <FiEye className="w-4 h-4" />
              <span>{formatViews(video.views || 0)} views</span>
            </div>
            {/* ✅ Updated to use formatTimeAgo */}
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default VideoCard;
