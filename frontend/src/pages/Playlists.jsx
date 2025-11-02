import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getUserPlaylists, createPlaylist } from '../services/api';
import { FiList, FiPlus, FiVideo, FiLock, FiGlobe } from 'react-icons/fi';

function Playlists() {
  const { user } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: true,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const response = await getUserPlaylists(user._id);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await createPlaylist(newPlaylist);
      setPlaylists([response.data, ...playlists]);
      setNewPlaylist({ name: '', description: '', isPublic: true });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create playlist:', error);
      alert('Failed to create playlist');
    } finally {
      setCreating(false);
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
            <FiList className="text-[var(--color-neon-purple)]" />
            <span>My Playlists</span>
          </h1>
          <p className="text-gray-400">{playlists.length} playlists</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="text-center py-20 card">
          <div className="w-20 h-20 bg-[var(--color-dark-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <FiList className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
          <p className="text-gray-400 mb-6">Create your first playlist to organize your videos</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Link
              key={playlist._id}
              to={`/playlist/${playlist._id}`}
              className="card card-hover overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-[var(--color-neon-purple)] to-[var(--color-neon-blue)]">
                {playlist.videos?.[0]?.thumbnail ? (
                  <img
                    src={playlist.videos[0].thumbnail}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiList className="w-16 h-16 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/70 px-2 py-1 rounded text-xs">
                  <FiVideo className="w-3 h-3" />
                  <span>{playlist.videosCount || 0}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{playlist.name}</h3>
                  {playlist.isPublic ? (
                    <FiGlobe className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <FiLock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                {playlist.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {playlist.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {playlist.isPublic ? 'Public' : 'Private'} playlist
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-dark-secondary)] rounded-2xl max-w-md w-full border border-[var(--color-dark-border)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-dark-border)]">
              <h2 className="text-2xl font-bold">Create Playlist</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-[var(--color-dark-tertiary)] rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePlaylist} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Playlist Name *</label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  placeholder="Enter playlist name"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  placeholder="Describe your playlist"
                  className="input min-h-[100px] resize-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newPlaylist.isPublic}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, isPublic: e.target.checked })}
                  className="w-5 h-5 accent-[var(--color-neon-purple)]"
                />
                <label htmlFor="isPublic" className="text-sm font-medium">
                  Make this playlist public
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
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

export default Playlists;
