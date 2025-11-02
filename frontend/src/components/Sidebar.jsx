import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  FiHome,
  FiTrendingUp,
  FiHeart,
  FiClock,
  FiList,
  FiUsers,
  FiMessageSquare,
  FiBarChart2,
} from 'react-icons/fi';

function Sidebar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const menuItems = [
    { icon: FiHome, label: 'Home', path: '/', auth: false },
    { icon: FiTrendingUp, label: 'Trending', path: '/trending', auth: false },
    { icon: FiUsers, label: 'Subscriptions', path: '/subscriptions', auth: true },
  ];

  const libraryItems = [
    { icon: FiClock, label: 'History', path: '/history', auth: true },
    { icon: FiHeart, label: 'Liked Videos', path: '/liked-videos', auth: true },
    { icon: FiList, label: 'Playlists', path: '/playlists', auth: true },
  ];

  const socialItems = [
    { icon: FiMessageSquare, label: 'Tweets', path: '/tweets', auth: true },
    { icon: FiBarChart2, label: 'Dashboard', path: '/dashboard', auth: true },
  ];

  const NavItem = ({ icon: Icon, label, path, active }) => (
    <Link
      to={path}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
        active
          ? 'bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-white border-l-4 border-neon-purple'
          : 'text-gray-400 hover:bg-dark-tertiary hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-dark-secondary border-r border-dark-border overflow-y-auto">
      <nav className="p-4 space-y-6">
        {/* Main Menu */}
        <div>
          {menuItems.map((item) => (
            (!item.auth || user) && (
              <NavItem
                key={item.path}
                {...item}
                active={location.pathname === item.path}
              />
            )
          ))}
        </div>

        {/* Library Section */}
        {user && (
          <>
            <div className="border-t border-dark-border pt-6">
              <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Library
              </h3>
              {libraryItems.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  active={location.pathname === item.path}
                />
              ))}
            </div>

            {/* Social Section */}
            <div className="border-t border-dark-border pt-6">
              <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Social
              </h3>
              {socialItems.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  active={location.pathname === item.path}
                />
              ))}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
