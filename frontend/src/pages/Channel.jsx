import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import SubscribeButton from '../components/SubscribeButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { getUserChannelProfile, getAllVideos } from '../services/api';
import { FiUsers, FiVideo, FiGrid } from 'react-icons/fi';

function Channel() {
  const { username } = useParams();
  const { user } = useContext(AuthContext);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    if (username) {
      fetchChannelData();
    }
  }, [username]);

  const fetchChannelData = async () => {
    setLoading(true);
    try {
      const channelRes = await getUserChannelProfile(username);
      const videosRes = await getAllVideos();

      const channelVideos = (videosRes.data?.videos || []).filter(
        video => video.owner?._id === channelRes.data._id
      );

      setChannel(channelRes.data);
      setVideos(channelVideos);
    } catch (error) {
      console.error('Failed to fetch channel data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!channel) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Channel not found</h2>
        <p className="text-gray-400">The channel you're looking for doesn't exist</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] rounded-2xl overflow-hidden">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      {/* Channel Info */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <img
            src={channel.avatar || '/default-avatar.png'}
            alt={channel.username}
            className="w-32 h-32 rounded-full border-4 border-[var(--color-dark-border)]"
          />

          {/* Info & Actions */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{channel.fullName}</h1>
            <p className="text-gray-400 mb-4">@{channel.username}</p>

            <div className="flex items-center space-x-6 text-sm mb-6">
              <div className="flex items-center space-x-2">
                <FiUsers className="w-5 h-5 text-[var(--color-neon-purple)]" />
                <span className="font-semibold">{channel.subscribersCount || 0}</span>
                <span className="text-gray-400">subscribers</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiVideo className="w-5 h-5 text-[var(--color-neon-blue)]" />
                <span className="font-semibold">{videos.length}</span>
                <span className="text-gray-400">videos</span>
              </div>
            </div>

            {user?._id !== channel._id && (
              <SubscribeButton
                channelId={channel._id}
                subscriberCount={channel.subscribersCount || 0}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-[var(--color-dark-border)]">
        {[
          { id: 'videos', label: 'Videos', icon: FiVideo },
          { id: 'about', label: 'About', icon: FiGrid },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-[var(--color-neon-purple)] border-b-2 border-[var(--color-neon-purple)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' ? (
        videos.length === 0 ? (
          <div className="text-center py-20">
            <FiVideo className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
            <p className="text-gray-400">This channel hasn't uploaded any videos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )
      ) : (
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">About this channel</h3>
          <div className="space-y-4 text-gray-300">
            <div>
              <span className="text-gray-500">Username:</span> @{channel.username}
            </div>
            <div>
              <span className="text-gray-500">Full Name:</span> {channel.fullName}
            </div>
            <div>
              <span className="text-gray-500">Subscribers:</span> {channel.subscribersCount || 0}
            </div>
            <div>
              <span className="text-gray-500">Subscribed To:</span> {channel.channelsSunscribedTo || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Channel;
