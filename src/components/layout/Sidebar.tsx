import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutDashboard, DollarSign, LineChart, FileText } from 'lucide-react';
import { SystemStatus } from '../shared/SystemStatus';

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
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-400 hover:bg-indigo-600/20 hover:text-indigo-400'}
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
  const [systemStatus] = useState({
    database: true,
    api: true,
    storage: true
  });

  return (
    <div 
      className={`
        bg-black rounded-2xl flex flex-col flex-shrink-0 sticky top-4 h-[calc(100vh-2rem)]
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <h1 className="text-white font-bold text-xl">Dashboard</h1>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 p-1 rounded-lg hover:bg-indigo-600/20"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 p-2 space-y-2 overflow-hidden">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/vendas" icon={<DollarSign size={20} />} label="Vendas" collapsed={collapsed} />
        <NavItem to="/analysis" icon={<LineChart size={20} />} label="Análise" collapsed={collapsed} />
        <NavItem to="/dre" icon={<FileText size={20} />} label="DRE" collapsed={collapsed} />
      </nav>
      
      {!collapsed && <SystemStatus status={systemStatus} />}
    </div>
  );
};

export default Sidebar;