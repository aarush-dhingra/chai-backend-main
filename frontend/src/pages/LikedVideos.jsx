import { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getLikedVideos } from '../services/api';
import { FiHeart } from 'react-icons/fi';

function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  const fetchLikedVideos = async () => {
    setLoading(true);
    try {
      const response = await getLikedVideos();
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Failed to fetch liked videos:', error);
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
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
          <FiHeart className="text-[var(--color-neon-pink)]" />
          <span>Liked Videos</span>
        </h1>
        <p className="text-gray-400">{videos.length} videos you liked</p>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-20 card">
          <div className="w-20 h-20 bg-[var(--color-dark-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHeart className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No liked videos</h3>
          <p className="text-gray-400">Videos you like will appear here</p>
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

export default LikedVideos;
