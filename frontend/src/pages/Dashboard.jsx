import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getChannelStats, getChannelVideos } from '../services/api';
import { FiEye, FiHeart, FiUsers, FiVideo, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';

function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user?._id]);

  const fetchDashboardData = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await getChannelStats();
      console.log('Stats Response:', statsRes);
      setStats(statsRes.data);

      // Fetch videos
      const videosRes = await getChannelVideos(user._id);
      console.log('Videos Response:', videosRes);
      
      // Extract videos array from response
      // Backend returns: { data: { videos: [...], page, limit, total, totalPages } }
      const videosArray = videosRes.data?.videos || [];
      setVideos(videosArray);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(null);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (authLoading || !user) {
    return <LoadingSpinner />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      icon: FiEye,
      label: 'Total Views',
      value: stats?.totalViews || 0,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiUsers,
      label: 'Subscribers',
      value: stats?.totalSubscribers || 0,
      color: 'from-neon-purple to-neon-pink',
    },
    {
      icon: FiVideo,
      label: 'Total Videos',
      value: stats?.totalVideos || 0,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: FiHeart,
      label: 'Total Likes',
      value: stats?.totalLikes || 0,
      color: 'from-red-500 to-neon-pink',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
            <FiTrendingUp className="text-neon-purple" />
            <span>Channel Dashboard</span>
          </h1>
          <p className="text-gray-400">Overview of your channel performance</p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
        >
          <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="card p-6 hover:border-neon-purple/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {typeof stat.value === 'number'
                  ? stat.value.toLocaleString()
                  : stat.value}
              </h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Videos Performance */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent Videos Performance</h2>
          <span className="text-sm text-gray-400">
            {videos && Array.isArray(videos) ? videos.length : 0} videos
          </span>
        </div>

        <div className="space-y-4">
          {!videos || videos.length === 0 ? (
            <div className="text-center py-12">
              <FiVideo className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No videos uploaded yet</p>
            </div>
          ) : (
            videos.map((video) => (
              <div
                key={video._id}
                className="flex items-center space-x-4 p-4 rounded-lg hover:bg-dark-tertiary/50 transition-colors border border-dark-border hover:border-neon-purple/30"
              >
                {/* Thumbnail */}
                <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-dark-tertiary">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiVideo className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-2 line-clamp-1">
                    {video.title}
                  </h3>
                  <div className="flex items-center space-x-6 text-sm text-gray-400 flex-wrap">
                    <div className="flex items-center space-x-1">
                      <FiEye className="w-4 h-4" />
                      <span>{(video.views || 0).toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiHeart className="w-4 h-4" />
                      <span>{(video.likesCount || 0).toLocaleString()} likes</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    video.isPublished
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {video.isPublished ? 'Published' : 'Draft'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
