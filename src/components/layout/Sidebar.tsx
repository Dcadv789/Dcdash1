import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Building2, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, collapsed }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex items-center px-4 py-3 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-gray-800 text-white' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="ml-3 font-medium">{label}</span>}
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();

  return (
    <div 
      className={`
        fixed left-4 top-4 bottom-4 bg-black rounded-2xl transition-all duration-300 flex flex-col z-10
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <h1 className="text-white font-bold text-xl">Dashboard</h1>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 p-2 space-y-2">
        <NavItem to="/" icon={<Home size={20} />} label="Home" collapsed={collapsed} />
        <NavItem to="/users" icon={<Users size={20} />} label="Users" collapsed={collapsed} />
        <NavItem to="/companies" icon={<Building2 size={20} />} label="Companies" collapsed={collapsed} />
      </nav>
      
      <div className="p-2 border-t border-gray-800">
        <button 
          onClick={signOut}
          className={`
            flex items-center px-4 py-3 rounded-lg text-gray-400 
            hover:bg-gray-800 hover:text-white transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;