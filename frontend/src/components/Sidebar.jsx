import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import { 
  LayoutDashboard, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  Settings, 
  Flower2, 
  Wallet,
  LogOut,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { authenticated, user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: CreditCard },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Budget', path: '/budget', icon: Wallet },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Sidebar Header Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border bg-black/10">
        <NavLink to="/" className="flex items-center gap-3 group">
          <img src={logoImg} alt="SpendWise Logo" className="h-[52px] w-[52px] object-contain group-hover:scale-105 transition-transform" />
          <div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-primary transition-colors">SpendWise</span>
            <span className="text-[10px] block text-muted-foreground font-semibold -mt-1 tracking-wider uppercase">Smart Tracker</span>
          </div>
        </NavLink>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium
                ${isActive 
                  ? 'bg-primary/20 text-primary border-l-4 border-primary shadow-orchid-glow-sm font-semibold' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110`} />
                <span>{item.name}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Info Card */}
      <div className="p-4 border-t border-border bg-black/20">
        {authenticated ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center font-bold text-white shadow-orchid-glow-sm">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.email || user?.phone || 'SpendWise User'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Wallet className="h-3 w-3 text-primary" />
                  <p className="text-[10px] text-muted-foreground truncate font-mono">
                    {user?.wallet ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : 'No wallet connected'}
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-red-400 bg-red-950/20 border border-red-900/30 hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="p-3 text-center rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground mb-2">Login to sync expenses</p>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-primary/40 w-1/3 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
