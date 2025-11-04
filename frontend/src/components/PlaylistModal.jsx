import { useState, useEffect, useContext } from 'react';
import { FiX, FiCheck, FiPlus } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { getUserPlaylists, addVideoToPlaylist, createPlaylist } from '../services/api';

function PlaylistModal({ videoId, isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchPlaylists();
    }
  }, [isOpen, user?._id]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching playlists for user:', user._id);  // ← DEBUG
      
      // ✅ Pass userId to the API
      const response = await getUserPlaylists(user._id);
      console.log('Playlists Response:', response);  // ← DEBUG
      
      // Handle different response structures
      let playlistsData = [];
      
      if (Array.isArray(response.data)) {
        playlistsData = response.data;
      } else if (response.data?.playlists) {
        playlistsData = response.data.playlists;
      } else if (response.data?.data) {
        playlistsData = response.data.data;
      } else if (Array.isArray(response)) {
        playlistsData = response;
      } else if (response.playlists) {
        playlistsData = response.playlists;
      }
      
      console.log('Processed Playlists:', playlistsData);  // ← DEBUG
      setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
      setError('Failed to load playlists');
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newPlaylistName.trim()) {
      setError('Playlist name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Creating playlist:', newPlaylistName);
      
      const createResponse = await createPlaylist({
        name: newPlaylistName,
        description: 'My Playlist',
      });

      console.log('Created playlist:', createResponse);
      
      const newPlaylistId = createResponse.data?._id || createResponse._id;

      if (!newPlaylistId) {
        setError('Failed to get playlist ID');
        return;
      }

      console.log('Adding video to playlist:', newPlaylistId);
      
      await addVideoToPlaylist(newPlaylistId, videoId);

      alert('✅ Playlist created and video added!');
      setNewPlaylistName('');
      setShowCreateNew(false);
      setSelectedPlaylistId(null);
      
      // Refresh playlist list
      await fetchPlaylists();
      
      onClose();
    } catch (err) {
      console.error('Failed to create playlist:', err);
      setError(err.response?.data?.message || 'Error creating playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId) {
      setError('Please select a playlist');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Adding video to playlist:', selectedPlaylistId);
      
      await addVideoToPlaylist(selectedPlaylistId, videoId);
      
      alert('✅ Video added to playlist!');
      setSelectedPlaylistId(null);
      
      onClose();
    } catch (err) {
      console.error('Failed to add video to playlist:', err);
      setError(err.response?.data?.message || 'Error adding video to playlist');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-dark-secondary)] rounded-lg p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Add to Playlist</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--color-dark-tertiary)] rounded transition-colors"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Create New Playlist Form */}
        {showCreateNew ? (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => {
                setNewPlaylistName(e.target.value);
                setError('');
              }}
              placeholder="Enter playlist name..."
              className="input w-full bg-[var(--color-dark-tertiary)] text-white placeholder-gray-500 rounded px-3 py-2 border border-[var(--color-dark-border)] focus:border-[var(--color-neon-purple)] focus:outline-none"
              disabled={loading}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateAndAdd}
                disabled={loading || !newPlaylistName.trim()}
                className="flex-1 bg-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)]/80 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create & Add'}
              </button>
              <button
                onClick={() => {
                  setShowCreateNew(false);
                  setNewPlaylistName('');
                  setError('');
                }}
                disabled={loading}
                className="flex-1 bg-[var(--color-dark-tertiary)] hover:bg-[var(--color-dark-border)] text-white font-semibold py-2 px-4 rounded disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Existing Playlists */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-[var(--color-neon-purple)] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : playlists && playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <label
                    key={playlist._id}
                    className="flex items-center space-x-3 p-3 bg-[var(--color-dark-tertiary)] rounded-lg hover:bg-[var(--color-dark-border)] cursor-pointer transition-colors border border-transparent hover:border-[var(--color-neon-purple)]"
                  >
                    <input
                      type="radio"
                      name="playlist"
                      value={playlist._id}
                      checked={selectedPlaylistId === playlist._id}
                      onChange={(e) => {
                        setSelectedPlaylistId(e.target.value);
                        setError('');
                      }}
                      className="w-4 h-4 cursor-pointer accent-[var(--color-neon-purple)]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{playlist.name}</p>
                      <p className="text-xs text-gray-400">
                        {playlist.videos?.length || 0} video{playlist.videos?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No playlists yet</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleAddToPlaylist}
                disabled={loading || !selectedPlaylistId}
                className="w-full bg-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)]/80 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
              >
                <FiCheck className="w-5 h-5" />
                <span>{loading ? 'Adding...' : 'Add to Selected'}</span>
              </button>
              <button
                onClick={() => {
                  setShowCreateNew(true);
                  setError('');
                }}
                disabled={loading}
                className="w-full bg-[var(--color-dark-tertiary)] hover:bg-[var(--color-dark-border)] text-white font-semibold py-2 px-4 rounded disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                <span>Create New Playlist</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PlaylistModal;
