import { Link } from 'react-router-dom';
import { FiList, FiVideo, FiLock, FiGlobe } from 'react-icons/fi';

function PlaylistCard({ playlist }) {
  return (
    <Link
      to={`/playlist/${playlist._id}`}
      className="card card-hover overflow-hidden group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-neon-purple to-neon-blue">
        {playlist.videos?.[0]?.thumbnail ? (
          <img
            src={playlist.videos[0].thumbnail}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiList className="w-16 h-16 text-white/50" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Video Count Badge */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold">
          <FiVideo className="w-3 h-3" />
          <span>{playlist.videosCount || playlist.videos?.length || 0}</span>
        </div>

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-neon-purple rounded-full flex items-center justify-center">
            <FiList className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-neon-purple transition-colors flex-1">
            {playlist.name}
          </h3>
          {playlist.isPublic ? (
            <FiGlobe className="w-4 h-4 text-green-400 flex-shrink-0 ml-2 mt-1" title="Public" />
          ) : (
            <FiLock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2 mt-1" title="Private" />
          )}
        </div>

        {playlist.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {playlist.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{playlist.isPublic ? 'Public' : 'Private'} playlist</span>
          {playlist.owner?.username && (
            <span className="text-gray-600">@{playlist.owner.username}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default PlaylistCard;
