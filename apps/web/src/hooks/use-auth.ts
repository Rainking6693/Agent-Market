'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getAuthStatus, handleSignOut } from '@/app/actions/auth';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const router = useRouter();
  const { user, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount and periodically
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isAuthenticated: authStatus, user: authUser } = await getAuthStatus();
        setIsAuthenticated(authStatus);
        if (authStatus && authUser) {
          setAuth(authUser, ''); // Logto handles tokens via cookies
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        clearAuth();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Check auth status every 30 seconds
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, [setAuth, clearAuth]);

  const logout = async () => {
    try {
      await handleSignOut();
      clearAuth();
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      clearAuth();
      router.push('/');
    }
  };

  return {
    user,
    token: null, // Logto handles tokens via cookies
    isAuthenticated,
    isLoading,
    login: () => {
      // Login is handled by SignInButton component
      console.warn('Use SignInButton component for login');
    },
    loginStatus: 'idle' as const,
    loginError: null,
    register: () => {
      // Registration is handled by SignInButton component
      console.warn('Use SignInButton component for registration');
    },
    registerStatus: 'idle' as const,
    registerError: null,
    logout,
  };
}
