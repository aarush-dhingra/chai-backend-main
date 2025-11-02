import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center -ml-64">
      <div className="text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-9xl font-bold bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] bg-clip-text text-transparent">
              404
            </div>
            <FiAlertCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-[var(--color-neon-purple)]/20" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center space-x-4">
          <Link to="/" className="btn-primary flex items-center space-x-2">
            <FiHome className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>

        {/* Decoration */}
        <div className="mt-12 flex items-center justify-center space-x-2 text-gray-600">
          <div className="w-20 h-px bg-gradient-to-r from-transparent to-gray-600" />
          <span className="text-sm">Lost in the void</span>
          <div className="w-20 h-px bg-gradient-to-l from-transparent to-gray-600" />
        </div>
      </div>
    </div>
  );
}

export default NotFound;
