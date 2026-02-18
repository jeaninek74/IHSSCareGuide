import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProfile } from '@ihss/shared-types';
import { apiClient } from '../services/apiClient';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, timezone?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshUser = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data.success) {
        setState({
          user: res.data.data.user,
          profile: res.data.data.profile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({ user: null, profile: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      setState({ user: null, profile: null, isAuthenticated: false, isLoading: false });
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.success) {
      setState({
        user: res.data.data.user,
        profile: res.data.data.profile,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      throw new Error(res.data.error?.message || 'Login failed');
    }
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    setState({ user: null, profile: null, isAuthenticated: false, isLoading: false });
  };

  const register = async (email: string, password: string, name: string, timezone?: string) => {
    const res = await apiClient.post('/auth/register', { email, password, name, timezone });
    if (res.data.success) {
      setState({
        user: res.data.data.user,
        profile: res.data.data.profile,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      throw new Error(res.data.error?.message || 'Registration failed');
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
