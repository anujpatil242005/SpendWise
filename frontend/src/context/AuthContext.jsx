import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { setTokenResolver } from '../lib/api';
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-react';

// Unified Context
const AuthContext = createContext(null);

const UnifiedAuthProviderWrapper = ({ children, isMock }) => {
  const [dbUser, setDbUser] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Conditional hook instantiation for mock safety
  let clerkAuth = null;
  let clerkUserObj = null;
  
  try {
    if (!isMock) {
      clerkAuth = useClerkAuth();
      const userRes = useClerkUser();
      clerkUserObj = userRes?.user;
    }
  } catch (err) {
    console.warn('[Auth Provider Warning] Failed to instantiate Clerk SDK hooks. Reverting to Offline Dev Mode.', err);
    isMock = true;
  }

  // --- Dynamic Mock Auth Engine (For Local Offline Development) ---
  const [mockAuthenticated, setMockAuthenticated] = useState(false);
  const [mockLoading, setMockLoading] = useState(true);

  useEffect(() => {
    if (isMock) {
      const savedAuth = localStorage.getItem('orchid_mock_authenticated');
      if (savedAuth === 'true') {
        setMockAuthenticated(true);
        setDbUser({
          userId: 'usr_spendwise_demo_123',
          email: 'spendwise.beginner@example.com',
          displayName: 'SpendWise User',
        });
      }
      setMockLoading(false);
    }
  }, [isMock]);

  const mockLogin = () => {
    setMockAuthenticated(true);
    localStorage.setItem('orchid_mock_authenticated', 'true');
    localStorage.setItem('privy_auth_token', 'mock_jwt_token_orchid_expense');
    setDbUser({
      userId: 'usr_spendwise_demo_123',
      email: 'spendwise.beginner@example.com',
      displayName: 'SpendWise User',
    });
  };

  const mockLogout = () => {
    setMockAuthenticated(false);
    setDbUser(null);
    localStorage.removeItem('orchid_mock_authenticated');
    localStorage.removeItem('privy_auth_token');
  };

  // --- Real Mongoose/MongoDB Profile Sync Loop ---
  const authenticated = isMock ? mockAuthenticated : (clerkAuth?.isSignedIn || false);
  const user = isMock ? dbUser : clerkUserObj;
  const ready = isMock ? !mockLoading : (clerkAuth?.isLoaded || false);

  useEffect(() => {
    if (isMock || !authenticated || !user) {
      if (!authenticated) setDbUser(null);
      return;
    }

    const synchronizeProfile = async () => {
      try {
        setSyncing(true);
        console.log('[Auth Context] User authenticated in Clerk, fetching access token...');
        
        const token = await clerkAuth.getToken();
        if (!token) throw new Error('No access token returned from Clerk.');

        // Build synchronization parameters
        const email = user.primaryEmailAddress?.emailAddress || '';
        const displayName = user.fullName || user.username || '';

        console.log('[Auth Context] Synchronizing details with MongoDB...');
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/sync`,
          { email, displayName },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.success) {
          console.log('[Auth Context] MongoDB Sync completed successfully:', response.data.data);
          setDbUser(response.data.data);
        }
      } catch (error) {
        console.warn(
          '[Auth Context Sync Warning] Failed to sync account with MongoDB. Check backend status or environment configurations.',
          error.message
        );
      } finally {
        setSyncing(false);
      }
    };

    synchronizeProfile();
  }, [authenticated, user, isMock]);

  // Expose unified authentication structure
  const value = {
    ready,
    authenticated,
    syncing,
    user: isMock ? dbUser : {
      id: user?.id || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      displayName: user?.fullName || user?.username || '',
    },
    dbUser,
    login: isMock ? mockLogin : (() => { window.location.href = '/login'; }),
    logout: isMock ? mockLogout : (clerkAuth?.signOut || (() => {})),
    getAccessToken: isMock 
      ? async () => 'mock_jwt_token_orchid_expense' 
      : (async () => {
          try {
            return await clerkAuth.getToken();
          } catch (e) {
            console.error('[Clerk] Failed to get session token', e);
            return '';
          }
        }),
    isMock,
  };

  useEffect(() => {
    setTokenResolver(value.getAccessToken);
  }, [value.getAccessToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }) => {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isMock = !clerkPubKey || clerkPubKey.startsWith('clxxxx') || clerkPubKey.includes('publishable_key');

  return (
    <UnifiedAuthProviderWrapper isMock={isMock}>
      {children}
    </UnifiedAuthProviderWrapper>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
