import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import LikeButton from '../components/LikeButton';
import SubscribeButton from '../components/SubscribeButton';
import CommentSection from '../components/CommentSection';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVideoById, getAllVideos } from '../services/api';
import { FiEye, FiCalendar, FiShare2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

function VideoDetail() {
  const { videoId } = useParams();
  const { user } = useContext(AuthContext);
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (videoId) {
      fetchVideo();
      fetchRelatedVideos();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    setLoading(true);
    try {
      const response = await getVideoById(videoId);
      setVideo(response.data);
    } catch (error) {
      console.error('Failed to fetch video:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const response = await getAllVideos({ limit: 8 });
      setRelatedVideos(response.data.videos || []);
    } catch (error) {
      console.error('Failed to fetch related videos:', error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!video) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Video not found</h2>
        <p className="text-gray-400">The video you're looking for doesn't exist</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Video Player */}
        <VideoPlayer videoUrl={video.videoFile} thumbnail={video.thumbnail} />

        {/* Video Info */}
        <div>
          <h1 className="text-2xl font-bold mb-4">{video.title}</h1>

          {/* Stats & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <FiEye className="w-4 h-4" />
                <span>{video.views || 0} views</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <LikeButton videoId={video._id} initialLikesCount={video.likesCount} />
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-dark-tertiary)] hover:bg-[var(--color-dark-border)] rounded-lg transition-colors"
              >
                <FiShare2 className="w-5 h-5" />
                <span className="font-semibold">Share</span>
              </button>
            </div>
          </div>

          {/* Channel Info */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <Link
                to={`/channel/${video.owner?.username}`}
                className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
              >
                <img
                  src={video.owner?.avatar || '/default-avatar.png'}
                  alt={video.owner?.username}
                  className="w-14 h-14 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-lg">{video.owner?.fullName}</h3>
                  <p className="text-sm text-gray-400">@{video.owner?.username}</p>
                </div>
              </Link>

              {user?._id !== video.owner?._id && (
                <SubscribeButton
                  channelId={video.owner?._id}
                  subscriberCount={video.owner?.subscribersCount}
                />
              )}
            </div>

            {/* Description */}
            {video.description && (
              <div className="mt-4 pt-4 border-t border-[var(--color-dark-border)]">
                <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <CommentSection videoId={videoId} />
      </div>

      {/* Sidebar - Related Videos */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Related Videos</h3>
        {relatedVideos.map((relatedVideo) => (
          <VideoCard key={relatedVideo._id} video={relatedVideo} />
        ))}
      </div>
    </div>
  );
}

export default VideoDetail;
