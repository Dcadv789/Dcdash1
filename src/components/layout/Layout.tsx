import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-4 flex gap-4">
      <Sidebar />
      <div className="flex-1 flex flex-col gap-4" style={{ maxWidth: '1920px' }}>
        <Navbar />
        <main className="flex-1">
          <div className="bg-black rounded-2xl p-6 min-h-[calc(100vh-8rem)] overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;