'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import type { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();


  const fetchUser = useCallback(async () => {
    try {
      // Check if we have an access token OR if we are in environment that uses cookies
      // This is just a hint to avoid unnecessary 401s if we definitely aren't logged in
      const hasToken = typeof window !== 'undefined' && localStorage.getItem('access_token');
      
      // If we don't have a token, we might still have a cookie, so we still fetch,
      // but we do it silently if possible.
      const response = await api.get('/users/profile/');
      if (response.data) {
        setUser(response.data);
      }
    } catch (error: any) {
      // If it's a 401, we are definitely NOT logged in
      if (error.response?.status === 401) {
        setUser(null);
      }
      // Otherwise, keep the current state (maybe it's a network error)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only run if we aren't already loading and don't have a user
    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser, user]);


  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await api.post('/users/login/', { email, password });
      
      if (response.data && response.data.user) {
        const user = response.data.user;
        setUser(user);
        
        // Handle redirects based on onboarding and role
        if (user.onboarding_status === 'not_started' || !user.onboarding_status) {
          router.push('/onboarding');
        } else if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'chef') {
          router.push('/chef/dashboard');
        } else {
          router.push('/client/home');
        }
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('[Foodie] Login failed full error:', error.response?.data);
      const data = error.response?.data;
      const message = data?.detail 
        || (data && typeof data === 'object' ? Object.values(data).flat().join(' ') : null)
        || error.message;
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setLoading(true);
      // Split full_name into first and last name for Django
      const nameParts = (data.full_name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        email: data.email,
        username: data.username,
        first_name: firstName,
        last_name: lastName,
        password: data.password,
        password_confirm: data.password2 || data.password,
        role: data.role,
      };

      const response = await api.post('/users/register/', payload);
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        // After registration, always go to onboarding
        router.push('/onboarding');
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('[Foodie] Registration failed full error:', error.response?.data);
      const errorMessage = error.response?.data 
        ? Object.values(error.response.data).flat().join(' ') 
        : error.message;
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/users/logout/');
    } catch (error) {
      console.error('[Foodie] Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setLoading(false);
      router.push('/login');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    refreshUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
