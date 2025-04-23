import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Settings, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Get page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    return path.charAt(1).toUpperCase() + path.slice(2);
  };

  return (
    <div className="bg-black rounded-2xl p-4 flex items-center justify-between z-10">
      <h1 className="text-white text-xl font-semibold">{getPageTitle()}</h1>
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-white transition-colors duration-200">
          <Bell size={20} />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors duration-200">
          <Settings size={20} />
        </button>
        <div className="flex items-center">
          <div className="bg-gray-800 rounded-full p-2 text-white">
            <User size={20} />
          </div>
          <span className="ml-2 text-white hidden md:block">
            {user?.email ? user.email.split('@')[0] : 'User'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;