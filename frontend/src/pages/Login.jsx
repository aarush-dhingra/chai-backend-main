import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/api';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser(formData);
      
      // Extract user and tokens from response
      const { user, accessToken, refreshToken } = response.data;

      // Call login with user data and tokens
      login(user, accessToken, refreshToken);
      
      // Redirect to home
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 -ml-64">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] bg-clip-text text-transparent">
              VideoStream
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue to your account</p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Username Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email or Username
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email or username"
                  className="input pl-11 w-full"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="input pl-11 pr-11 w-full"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Footer - Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[var(--color-neon-purple)] hover:text-[var(--color-neon-blue)] hover:underline font-semibold transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Hint */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Demo credentials available if needed</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
