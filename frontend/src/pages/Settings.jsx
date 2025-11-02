import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updateAccountDetails, changePassword, updateUserAvatar, updateUserCoverImage } from '../services/api';
import { FiUser, FiLock, FiImage, FiSave } from 'react-icons/fi';

function Settings() {
  const { user, checkAuth } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  // Password Form
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Avatar & Cover
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || '');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateAccountDetails(profileData);
      await checkAuth();
      showMessage('success', 'Profile updated successfully');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('success', 'Password changed successfully');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      await updateUserAvatar(file);
      await checkAuth();
      setAvatarPreview(URL.createObjectURL(file));
      showMessage('success', 'Avatar updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      await updateUserCoverImage(file);
      await checkAuth();
      setCoverPreview(URL.createObjectURL(file));
      showMessage('success', 'Cover image updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update cover image');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'password', label: 'Password', icon: FiLock },
    { id: 'media', label: 'Media', icon: FiImage },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account settings</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/50 text-green-400'
            : 'bg-red-500/10 border border-red-500/50 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-[var(--color-dark-border)]">
        {tabs.map((tab) => {
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
      <div className="card p-8">
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Username</label>
              <input
                type="text"
                value={user?.username}
                className="input"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <FiSave className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <FiLock className="w-5 h-5" />
              <span>{loading ? 'Changing...' : 'Change Password'}</span>
            </button>
          </form>
        )}

        {activeTab === 'media' && (
          <div className="space-y-8">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-semibold mb-4">Avatar</label>
              <div className="flex items-center space-x-6">
                <img
                  src={avatarPreview || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <label className="btn-secondary cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpdate}
                    className="hidden"
                    disabled={loading}
                  />
                  {loading ? 'Uploading...' : 'Change Avatar'}
                </label>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-semibold mb-4">Cover Image</label>
              <div className="space-y-4">
                <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)]">
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <label className="btn-secondary cursor-pointer inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpdate}
                    className="hidden"
                    disabled={loading}
                  />
                  {loading ? 'Uploading...' : 'Change Cover Image'}
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
