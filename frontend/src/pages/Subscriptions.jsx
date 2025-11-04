import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSubscribedChannels, getAllVideos } from '../services/api';
import { FiUsers, FiVideo } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Subscriptions() {
  const { user } = useContext(AuthContext);
  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
  if (user?._id) {  // ✅ Make sure user._id exists
    fetchData();
  }
}, [user?._id]);  // ✅ Depend on user._id, not user object


const fetchData = async () => {
  if (!user?._id) return;
  
  setLoading(true);
  try {
    const channelsRes = await getSubscribedChannels(user._id);
    const videosRes = await getAllVideos({ subscribed: true });
    
    // ✅ Backend returns: { statusCode, data: { channels, page, limit, ... }, message, success }
    // So extract channels from the nested data
    const channelsData = channelsRes.data?.channels || [];
    const videosData = videosRes.data?.videos || videosRes.videos || [];
    
    console.log('Channels:', channelsData);
    console.log('Videos:', videosData);
    
    setChannels(Array.isArray(channelsData) ? channelsData : []);
    setVideos(Array.isArray(videosData) ? videosData : []);
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    setChannels([]);
    setVideos([]);
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
          <FiUsers className="text-[var(--color-neon-blue)]" />
          <span>Subscriptions</span>
        </h1>
        <p className="text-gray-400">
          {channels.length} channels • {videos.length} new videos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-[var(--color-dark-border)]">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
            activeTab === 'videos'
              ? 'text-[var(--color-neon-purple)] border-b-2 border-[var(--color-neon-purple)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FiVideo className="w-5 h-5" />
          <span>Latest Videos</span>
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
            activeTab === 'channels'
              ? 'text-[var(--color-neon-purple)] border-b-2 border-[var(--color-neon-purple)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FiUsers className="w-5 h-5" />
          <span>Channels</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'videos' ? (
        videos.length === 0 ? (
          <div className="text-center py-20 card">
            <div className="w-20 h-20 bg-[var(--color-dark-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FiVideo className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
            <p className="text-gray-400">Subscribe to channels to see their latest videos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )
      ) : channels.length === 0 ? (
        <div className="text-center py-20 card">
          <div className="w-20 h-20 bg-[var(--color-dark-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No subscriptions</h3>
          <p className="text-gray-400">Start subscribing to channels you enjoy</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <Link
              key={channel._id}
              to={`/channel/${channel.username}`}
              className="card card-hover p-6"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={channel.avatar || '/default-avatar.png'}
                  alt={channel.username}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{channel.fullName}</h3>
                  <p className="text-sm text-gray-400">@{channel.username}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {channel.subscribersCount || 0} subscribers
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Subscriptions;
