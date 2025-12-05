import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getChannelStats, getChannelVideos, deleteVideo, updateVideo } from '../services/api';
import { FiEye, FiHeart, FiUsers, FiVideo, FiTrendingUp, FiRefreshCw, FiSearch, FiEdit2, FiTrash2, FiMoreVertical, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenuId, setShowMenuId] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

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
      const statsRes = await getChannelStats();
      setStats(statsRes.data);

      const videosRes = await getChannelVideos(user._id);
      const videosArray = videosRes.data?.videos || [];
      setVideos(videosArray);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(null);
      setVideos([]);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteVideo(videoId);
      setVideos(videos.filter(v => v._id !== videoId));
      showToast('Video deleted successfully', 'success');
      handleRefresh();
    } catch (error) {
      console.error('Failed to delete video:', error);
      showToast('Failed to delete video', 'error');
    }
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video._id);
    setEditTitle(video.title);
    setEditDescription(video.description);
    setShowMenuId(null);
  };

  const handleSaveEdit = async (videoId) => {
    try {
      await updateVideo(videoId, {
        title: editTitle,
        description: editDescription
      });

      setVideos(videos.map(v =>
        v._id === videoId
          ? { ...v, title: editTitle, description: editDescription }
          : v
      ));

      setEditingVideo(null);
      showToast('Video updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update video:', error);
      showToast('Failed to update video', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingVideo(null);
    setEditTitle('');
    setEditDescription('');
  };

  const filteredVideos = videos.filter(video =>
    video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !user) {
    return <LoadingSpinner />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const statsData = [
    { icon: FiVideo, label: 'Total Videos', value: stats?.totalVideos || 0, color: 'text-neon-purple' },
    { icon: FiEye, label: 'Total Views', value: stats?.totalViews || 0, color: 'text-neon-blue' },
    { icon: FiUsers, label: 'Subscribers', value: stats?.totalSubscribers || 0, color: 'text-neon-pink' },
    { icon: FiHeart, label: 'Total Likes', value: stats?.totalLikes || 0, color: 'text-red-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg ${toast.type === 'success'
            ? 'bg-green-500/90 text-white'
            : 'bg-red-500/90 text-white'
            }`}>
            {toast.type === 'success' ? (
              <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <FiXCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
            <FiTrendingUp className="text-[var(--color-neon-purple)]" />
            <span>Dashboard</span>
          </h1>
          <p className="text-gray-400">Overview of your channel performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
        >
          <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <span className="text-3xl font-bold">{stat.value}</span>
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Videos Section with Search */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Videos</h2>
          <span className="text-gray-400">{videos.length} videos</span>
        </div>

        {/* Search Bar - FIXED PADDING */}
        <div className="mb-6">
          <label className="relative flex items-center">
            <FiSearch className="absolute left-3 w-5 h-5 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search videos by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '2.5rem',
                paddingRight: '1rem'
              }}
              className="w-full px-0 py-3 bg-dark-secondary border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-neon-purple)] focus:ring-1 focus:ring-[var(--color-neon-purple)]"
            />
          </label>
        </div>

        {/* Videos List */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <FiVideo className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No videos found' : 'No videos uploaded yet'}
            </h3>
            <p className="text-gray-400">
              {searchQuery
                ? 'Try a different search term'
                : 'Start by uploading your first video'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map((video) => (
              <div
                key={video._id}
                className="flex items-start space-x-4 p-4 bg-dark-secondary rounded-lg hover:bg-dark-tertiary transition-colors"
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                />

                {/* Video Details */}
                <div className="flex-1 min-w-0">
                  {editingVideo === video._id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="input w-full"
                        placeholder="Video title"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="input w-full min-h-[80px] resize-none"
                        placeholder="Video description"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(video._id)}
                          className="btn-primary text-sm py-1.5 px-4"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-secondary text-sm py-1.5 px-4"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {video.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <FiEye className="w-4 h-4" />
                          <span>{video.views || 0} views</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FiHeart className="w-4 h-4" />
                          <span>{video.likesCount || 0} likes</span>
                        </span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions Menu */}
                {editingVideo !== video._id && (
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowMenuId(showMenuId === video._id ? null : video._id)}
                      className="p-2 hover:bg-dark-tertiary rounded-lg transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-400" />
                    </button>

                    {showMenuId === video._id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenuId(null)}
                        />
                        <div className="absolute right-0 mt-2 w-40 card shadow-xl z-20">
                          <button
                            onClick={() => handleEditVideo(video)}
                            className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-dark-tertiary text-left transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video._id)}
                            className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-dark-tertiary text-red-400 text-left transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
