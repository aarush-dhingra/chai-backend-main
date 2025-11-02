import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiSearch, FiUpload, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import VideoUploadModal from './VideoUploadModal';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${searchQuery}`);
    }
  };

  const handleLogout = async () => {
  try {
    await logout();
    navigate('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // Still navigate to login even if logout API fails
    navigate('/login');
  }
};

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-dark-secondary border-b border-dark-border z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
              VideoStream
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pr-12"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-dark-border rounded-lg transition-colors"
              >
                <FiSearch className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Upload Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-dark-tertiary hover:bg-dark-border rounded-lg transition-colors"
                >
                  <FiUpload className="w-5 h-5" />
                  <span className="font-medium">Upload</span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-neon-purple hover:border-neon-blue transition-colors"
                  >
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 card shadow-xl shadow-neon-purple/20">
                      <div className="p-4 border-b border-dark-border">
                        <p className="font-semibold">{user.fullName}</p>
                        <p className="text-sm text-gray-400">@{user.username}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/my-channel"
                          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-dark-tertiary transition-colors"
                        >
                          <FiUser className="w-5 h-5" />
                          <span>My Channel</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-dark-tertiary transition-colors"
                        >
                          <FiSettings className="w-5 h-5" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-dark-tertiary transition-colors"
                        >
                          <FiSettings className="w-5 h-5" />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-dark-tertiary text-red-400 transition-colors"
                        >
                          <FiLogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Upload Modal */}
      {showUploadModal && (
        <VideoUploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </>
  );
}

export default Header;
