import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex justify-center">
      <div className="w-[1920px] min-h-screen p-4 flex gap-4">
        <Sidebar />
        <div className="flex-1 flex flex-col gap-4">
          <Navbar />
          <main className="flex-1 min-h-0">
            <div className="bg-black rounded-2xl p-6 h-full">
              <div className="max-w-[1600px] mx-auto h-full">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;