import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAllVideos } from '../services/api';
import { FiTrendingUp, FiClock, FiStar, FiX } from 'react-icons/fi';

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  useEffect(() => {
    // Get search from URL and sync with state
    const query = searchParams.get('search');
    setSearchQuery(query || '');
  }, [searchParams]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = {
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

  // Filter logic
  let displayVideos = videos;
  if (searchQuery.trim()) {
    displayVideos = videos.filter(video => {
      const title = (video.title || '').toLowerCase();
      const description = (video.description || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }

  // ✅ Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams({}); // Remove search param from URL
  };

  const filters = [
    { id: 'all', label: 'All', icon: FiStar },
    { id: 'trending', label: 'Trending', icon: FiTrendingUp },
    { id: 'recent', label: 'Recent', icon: FiClock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
          <FiStar className="text-[var(--color-neon-purple)]" />
          <span>Discover</span>
        </h1>
        <p className="text-gray-400">Amazing videos from creators</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 items-center flex-wrap">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              filter === f.id
                ? 'bg-[var(--color-neon-purple)] text-white'
                : 'bg-dark-secondary text-gray-400 hover:bg-dark-tertiary'
            }`}
          >
            <f.icon className="w-4 h-4" />
            <span>{f.label}</span>
          </button>
        ))}

        {/* ✅ Clear Search Button - Shows only when searching */}
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors ml-auto"
          >
            <FiX className="w-4 h-4" />
            <span>Clear "{searchQuery}"</span>
          </button>
        )}
      </div>

      {/* Videos Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : displayVideos.length === 0 ? (
        <div className="text-center py-20">
          <FiStar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? 'No videos found' : 'No videos uploaded yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery 
              ? `Try a different search term` 
              : 'Start by uploading your first video'}
          </p>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="px-6 py-2 bg-[var(--color-neon-purple)] hover:bg-[var(--color-neon-blue)] rounded-lg transition-colors font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayVideos.map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
