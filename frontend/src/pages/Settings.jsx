import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  updateUserProfile,
  changeUserPassword,
  updateUserAvatar,
  updateUserCoverImage,
} from '../services/api';
import { FiSave, FiKey, FiImage, FiEye, FiEyeOff } from 'react-icons/fi';

function Settings() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Avatar/Cover state
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar);
  const [previewCover, setPreviewCover] = useState(user?.coverImage);

  // ========== Profile Update ==========
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateUserProfile({
        fullName: profileData.fullName,
        email: profileData.email,
      });

      setUser(response.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // ========== Password Change ==========
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await changeUserPassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess('Password changed successfully!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // ========== Avatar Update ==========
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewAvatar(e.target.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await updateUserAvatar(formData);
      setUser(response.data);
      setAvatarFile(null);
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  // ========== Cover Image Update ==========
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewCover(e.target.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleCoverSubmit = async (e) => {
    e.preventDefault();
    if (!coverFile) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('coverImage', coverFile);

      const response = await updateUserCoverImage(formData);
      setUser(response.data);
      setCoverFile(null);
      setSuccess('Cover image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cover image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-[var(--color-dark-border)]">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === 'profile'
              ? 'text-[var(--color-neon-purple)] border-b-2 border-[var(--color-neon-purple)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === 'password'
              ? 'text-[var(--color-neon-purple)] border-b-2 border-[var(--color-neon-purple)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === 'images'
              ? 'text-[var(--color-neon-purple)] border-b-2 border-[var(--color-neon-purple)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Images
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleProfileChange}
                disabled={loading}
                className="w-full input bg-[var(--color-dark-tertiary)] border border-[var(--color-dark-border)] rounded px-4 py-2 text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled={loading}
                className="w-full input bg-[var(--color-dark-tertiary)] border border-[var(--color-dark-border)] rounded px-4 py-2 text-white disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)]/80 text-white font-semibold py-3 rounded disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
            >
              <FiSave className="w-5 h-5" />
              <span>{loading ? 'Updating...' : 'Update Profile'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Old Password</label>
              <div className="relative">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  className="w-full input bg-[var(--color-dark-tertiary)] border border-[var(--color-dark-border)] rounded px-4 py-2 text-white pr-10 disabled:opacity-50"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.old ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  className="w-full input bg-[var(--color-dark-tertiary)] border border-[var(--color-dark-border)] rounded px-4 py-2 text-white pr-10 disabled:opacity-50"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  className="w-full input bg-[var(--color-dark-tertiary)] border border-[var(--color-dark-border)] rounded px-4 py-2 text-white pr-10 disabled:opacity-50"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)]/80 text-white font-semibold py-3 rounded disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
            >
              <FiKey className="w-5 h-5" />
              <span>{loading ? 'Updating...' : 'Change Password'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div className="space-y-8">
          {/* Avatar */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
              <FiImage className="w-6 h-6" />
              <span>Profile Picture</span>
            </h2>

            <div className="flex items-center space-x-6 mb-6">
              <img
                src={previewAvatar || '/default-avatar.png'}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <p className="text-gray-400 mb-3">Upload a new profile picture</p>
                <label className="px-4 py-2 bg-[var(--color-dark-tertiary)] hover:bg-[var(--color-dark-border)] rounded cursor-pointer transition-colors">
                  <span className="font-semibold">Choose File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {avatarFile && (
              <button
                onClick={handleAvatarSubmit}
                disabled={loading}
                className="w-full bg-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)]/80 text-white font-semibold py-3 rounded disabled:opacity-50 transition-colors"
              >
                {loading ? 'Uploading...' : 'Upload Avatar'}
              </button>
            )}
          </div>

          {/* Cover Image */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
              <FiImage className="w-6 h-6" />
              <span>Cover Image</span>
            </h2>

            <div className="mb-6">
              {previewCover && (
                <img
                  src={previewCover}
                  alt="Cover"
                  className="w-full h-32 object-cover rounded mb-4"
                />
              )}
              <label className="block px-4 py-2 bg-[var(--color-dark-tertiary)] hover:bg-[var(--color-dark-border)] rounded cursor-pointer transition-colors text-center font-semibold">
                <span>Choose Cover Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            </div>

            {coverFile && (
              <button
                onClick={handleCoverSubmit}
                disabled={loading}
                className="w-full bg-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)]/80 text-white font-semibold py-3 rounded disabled:opacity-50 transition-colors"
              >
                {loading ? 'Uploading...' : 'Upload Cover'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
