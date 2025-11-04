import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { registerUser } from '../services/api';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiImage } from 'react-icons/fi';

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    avatar: null,
    coverImage: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.avatar) {
    setError('Avatar is required');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // ✅ Create FormData object with files
    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('avatar', formData.avatar);  // ← Append the file
    if (formData.coverImage) {
      data.append('coverImage', formData.coverImage);
    }

    const response = await registerUser(data);
    login(response.data, response.data.accessToken, response.data.refreshToken);
    navigate('/');
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center p-4 -ml-64">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] bg-clip-text text-transparent">
              VideoStream
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-400">Sign up to start sharing your videos</p>
        </div>

        {/* Form */}
        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--color-dark-tertiary)] border-2 border-[var(--color-dark-border)] hover:border-[var(--color-neon-purple)] transition-colors flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FiImage className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-center text-xs text-gray-500">Click to upload avatar (required)</p>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="input pl-11"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  placeholder="Choose a username"
                  className="input pl-8"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="input pl-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                  className="input pl-11 pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--color-neon-purple)] hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
