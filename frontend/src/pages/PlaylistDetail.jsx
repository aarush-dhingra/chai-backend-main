import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPlaylistById, deletePlaylist, updatePlaylist, removeVideoFromPlaylist } from '../services/api';
import { FiList, FiEdit2, FiTrash2, FiLock, FiGlobe, FiMoreVertical } from 'react-icons/fi';

function PlaylistDetail() {
  const { playlistId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const response = await getPlaylistById(playlistId);
      setPlaylist(response.data);
      setEditData({
        name: response.data.name,
        description: response.data.description || '',
      });
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      await deletePlaylist(playlistId);
      navigate('/playlists');
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      alert('Failed to delete playlist');
    }
  };

  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();
    try {
      await updatePlaylist(playlistId, editData);
      setPlaylist({ ...playlist, ...editData });
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update playlist:', error);
      alert('Failed to update playlist');
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!confirm('Remove this video from playlist?')) return;
    
    try {
      await removeVideoFromPlaylist(playlistId, videoId);
      setPlaylist({
        ...playlist,
        videos: playlist.videos.filter(v => v._id !== videoId)
      });
    } catch (error) {
      console.error('Failed to remove video:', error);
      alert('Failed to remove video');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!playlist) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Playlist not found</h2>
        <p className="text-gray-400">The playlist you're looking for doesn't exist</p>
      </div>
    );
  }

  const isOwner = user?._id === playlist.owner?._id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            {/* Thumbnail */}
            <div className="w-48 aspect-video bg-gradient-to-br from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] rounded-lg flex items-center justify-center flex-shrink-0">
              {playlist.videos?.[0]?.thumbnail ? (
                <img
                  src={playlist.videos[0].thumbnail}
                  alt={playlist.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <FiList className="w-16 h-16 text-white/50" />
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold">{playlist.name}</h1>
                {playlist.isPublic ? (
                  <FiGlobe className="w-5 h-5 text-green-400" />
                ) : (
                  <FiLock className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              {playlist.description && (
                <p className="text-gray-400 mb-4">{playlist.description}</p>
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>{playlist.videos?.length || 0} videos</span>
                <span>{playlist.isPublic ? 'Public' : 'Private'}</span>
                <span>By {playlist.owner?.fullName}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-[var(--color-dark-tertiary)] rounded-lg transition-colors"
              >
                <FiMoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 card shadow-xl z-10">
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-[var(--color-dark-tertiary)] text-left"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit Playlist</span>
                  </button>
                  <button
                    onClick={handleDeletePlaylist}
                    className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-[var(--color-dark-tertiary)] text-red-400 text-left"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete Playlist</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Videos */}
      <div>
        <h2 className="text-xl font-bold mb-6">Videos in this playlist</h2>
        {!playlist.videos || playlist.videos.length === 0 ? (
          <div className="text-center py-20 card">
            <FiList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
            <p className="text-gray-400">This playlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlist.videos.map((video) => (
              <div key={video._id} className="relative group">
                <VideoCard video={video} />
                {isOwner && (
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-dark-secondary)] rounded-2xl max-w-md w-full border border-[var(--color-dark-border)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-dark-border)]">
              <h2 className="text-2xl font-bold">Edit Playlist</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-[var(--color-dark-tertiary)] rounded-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePlaylist} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Playlist Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="input min-h-[100px] resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistDetail;
