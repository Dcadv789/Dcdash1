import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex justify-center">
      <div className="w-[1920px] h-[1080px] p-4 flex gap-4">
        <Sidebar />
        <div className="flex-1 flex flex-col gap-4">
          <Navbar />
          <main className="flex-1">
            <div className="bg-black rounded-2xl p-6 h-[calc(1080px-8rem)]">
              <div className="max-w-[1600px] mx-auto">
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