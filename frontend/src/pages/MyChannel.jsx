import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAllVideos } from '../services/api';
import { FiEdit2, FiSettings, FiBarChart2 } from 'react-icons/fi';

function MyChannel() {
  const { user } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyVideos();
    }
  }, [user]);

  const fetchMyVideos = async () => {
    setLoading(true);
    try {
      const response = await getAllVideos({ userId: user._id });
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] rounded-2xl overflow-hidden">
        {user?.coverImage ? (
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
        <Link
          to="/settings"
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors"
        >
          <FiEdit2 className="w-5 h-5" />
        </Link>
      </div>

      {/* Channel Info */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt={user?.username}
            className="w-32 h-32 rounded-full border-4 border-[var(--color-dark-border)]"
          />

          {/* Info & Actions */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user?.fullName}</h1>
            <p className="text-gray-400 mb-4">@{user?.username}</p>

            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard" className="btn-primary flex items-center space-x-2">
                <FiBarChart2 className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link to="/settings" className="btn-secondary flex items-center space-x-2">
                <FiSettings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* My Videos */}
      <div>
        <h2 className="text-2xl font-bold mb-6">My Videos ({videos.length})</h2>
        {videos.length === 0 ? (
          <div className="text-center py-20 card">
            <div className="w-20 h-20 bg-[var(--color-dark-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FiEdit2 className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
            <p className="text-gray-400 mb-4">Start sharing your content with the world</p>
            <button className="btn-primary">Upload Video</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyChannel;
