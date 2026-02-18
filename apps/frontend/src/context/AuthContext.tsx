import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, UserProfile } from '../services/apiClient';

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
      const res = await authApi.me();
      setState({
        user: res.data.user,
        profile: res.data.profile,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      setState({ user: null, profile: null, isAuthenticated: false, isLoading: false });
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setState({
      user: res.data.user,
      profile: res.data.profile,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    await authApi.logout();
    setState({ user: null, profile: null, isAuthenticated: false, isLoading: false });
  };

  const register = async (email: string, password: string, name: string, timezone?: string) => {
    const res = await authApi.register(email, password, name, timezone);
    setState({
      user: res.data.user,
      profile: res.data.profile,
      isAuthenticated: true,
      isLoading: false,
    });
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
