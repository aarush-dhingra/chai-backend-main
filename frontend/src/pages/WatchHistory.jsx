import { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getWatchHistory } from '../services/api';
import { FiClock, FiTrash2 } from 'react-icons/fi';

function WatchHistory() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getWatchHistory();
      setVideos(response.data || []);
    } catch (error) {
      console.error('Failed to fetch watch history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
            <FiClock className="text-[var(--color-neon-purple)]" />
            <span>Watch History</span>
          </h1>
          <p className="text-gray-400">Videos you've watched recently</p>
        </div>
        {videos.length > 0 && (
          <button className="btn-secondary flex items-center space-x-2">
            <FiTrash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-20 card">
          <div className="w-20 h-20 bg-[var(--color-dark-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <FiClock className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No watch history</h3>
          <p className="text-gray-400">Videos you watch will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WatchHistory;
