import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden relative font-sans text-foreground">
      
      {/* Decorative Premium Background glowing highlights */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none select-none z-0 dark:block hidden" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none select-none z-0 dark:block hidden" />
      
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300"
        />
      )}

      {/* Main View Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10 relative">
        <Navbar toggleSidebar={toggleSidebar} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        {/* Scrollable Inner Page Outlet */}
        <main className="flex-1 p-6 relative">
          <Outlet context={{ searchQuery, setSearchQuery }} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
