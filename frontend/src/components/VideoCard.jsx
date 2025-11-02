import { Link } from 'react-router-dom';
import { FiPlay, FiEye } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

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
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-dark-primary/90 rounded text-xs font-semibold">
              {video.duration}
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
              className="w-6 h-6 rounded-full"
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
            <span>
              {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default VideoCard;
