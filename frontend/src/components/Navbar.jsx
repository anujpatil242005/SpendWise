import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  Bell
} from 'lucide-react';

const Navbar = ({ toggleSidebar, searchQuery, setSearchQuery }) => {
  const { authenticated } = useAuth();

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-6 glass-panel border-b border-border bg-background/50">
      {/* Left section: Hamburger menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white lg:hidden transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">SpendWise</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-white font-medium">Dashboard</span>
        </div>
      </div>



      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon */}
        <button className="p-2 rounded-full text-muted-foreground hover:bg-white/5 hover:text-white transition-all relative">
          <Bell className="h-4.5 w-4.5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
