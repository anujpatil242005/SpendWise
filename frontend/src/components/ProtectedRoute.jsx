import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { authenticated, ready } = useAuth();

  // 1. Show elegant loading spinner while Privy SDK initializes
  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative font-sans">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none select-none z-0" />
        <div className="text-center space-y-4 relative z-10">
          {/* Custom Orchid Spinner */}
          <div className="h-10 w-10 rounded-full border-t-2 border-primary border-r-2 border-primary/40 animate-spin mx-auto shadow-orchid-glow-sm" />
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider animate-pulse">
            Loading Privy Node...
          </p>
        </div>
      </div>
    );
  }

  // 2. If user is not authenticated, securely redirect back to the /login landing page
  if (!authenticated) {
    return <Navigate to="/login" replace={true} />;
  }

  // 3. Authenticated: Render children components
  return children;
};

export default ProtectedRoute;
