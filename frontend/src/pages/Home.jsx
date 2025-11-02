import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAllVideos } from '../services/api';
import { FiTrendingUp, FiClock, FiStar } from 'react-icons/fi';

function Home() {
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchVideos();
  }, [searchParams]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchParams.get('search') || '',
        sortBy: filter === 'trending' ? 'views' : 'createdAt',
        sortType: 'desc',
      };
      const response = await getAllVideos(params);
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All', icon: FiStar },
    { id: 'trending', label: 'Trending', icon: FiTrendingUp },
    { id: 'recent', label: 'Recent', icon: FiClock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {searchParams.get('search') ? `Search results for "${searchParams.get('search')}"` : 'Home'}
        </h1>
        <p className="text-gray-400">Discover amazing videos from creators</p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {filters.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setFilter(item.id);
                fetchVideos();
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === item.id
                  ? 'bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] text-white'
                  : 'bg-[var(--color-dark-secondary)] text-gray-400 hover:bg-[var(--color-dark-tertiary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Videos Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-[var(--color-dark-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <FiStar className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No videos found</h3>
          <p className="text-gray-400">Try a different search or filter</p>
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

export default Home;
