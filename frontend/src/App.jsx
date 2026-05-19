import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CurrencyProvider } from './context/CurrencyContext';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budget from './pages/Budget';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { Sparkles, Terminal } from 'lucide-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isMock = !clerkPubKey || clerkPubKey.startsWith('clxxxx') || clerkPubKey.includes('publishable_key');

// Shared beautiful placeholder layout for upcoming features
const PagePlaceholder = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center space-y-6 p-8 rounded-3xl glass-panel border border-primary/20">
      <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">
        <Sparkles className="h-10 w-10" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="p-4 w-full bg-black/40 border border-white/5 rounded-2xl flex items-start gap-3 text-left font-mono text-xs text-primary">
        <Terminal className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <span className="block text-white font-semibold mb-1">Architecture Node Ready</span>
          <span>Route successfully wired in react-router-dom. Controller structures prepared. Complete feature view builds out in the subsequent steps.</span>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const content = (
    <AuthProvider>
      <CurrencyProvider>
        <ToastProvider>
          <BrowserRouter>
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes containing Sidebar and Top Navbar */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              
              {/* Core pages */}
              <Route index element={<Dashboard />} />
              
              <Route path="expenses" element={<Expenses />} />
            
              <Route path="income" element={<Income />} />
            
              <Route path="budget" element={<Budget />} />
            
            <Route path="analytics" element={<Analytics />} />
            
            <Route path="settings" element={<Settings />} />

            {/* Catch-all route mapping back to dashboard */}
            <Route path="*" element={<Dashboard />} />

          </Route>
        </Routes>
        </BrowserRouter>
        </ToastProvider>
      </CurrencyProvider>
    </AuthProvider>
  );

  if (isMock) {
    return content;
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {content}
    </ClerkProvider>
  );
};

export default App;
