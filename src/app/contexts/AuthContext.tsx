import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  acceptedMarketing?: boolean;
  acceptedNewsletter?: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (payload: {
    idToken: string;
    acceptedTerms?: boolean;
    acceptedMarketing?: boolean;
    acceptedNewsletter?: boolean;
  }) => Promise<void>;
  loginWithApple: (payload: {
    idToken: string;
    name?: string;
    acceptedTerms?: boolean;
    acceptedMarketing?: boolean;
    acceptedNewsletter?: boolean;
  }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    acceptedTerms: boolean;
    acceptedMarketing?: boolean;
    acceptedNewsletter?: boolean;
  }) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('authToken', response.token);
    setUser(response.user);
  };

  const loginWithGoogle = async (payload: {
    idToken: string;
    acceptedTerms?: boolean;
    acceptedMarketing?: boolean;
    acceptedNewsletter?: boolean;
  }) => {
    const response = await authAPI.oauthGoogle(payload);
    localStorage.setItem('authToken', response.token);
    setUser(response.user);
  };

  const loginWithApple = async (payload: {
    idToken: string;
    name?: string;
    acceptedTerms?: boolean;
    acceptedMarketing?: boolean;
    acceptedNewsletter?: boolean;
  }) => {
    const response = await authAPI.oauthApple(payload);
    localStorage.setItem('authToken', response.token);
    setUser(response.user);
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    acceptedTerms: boolean;
    acceptedMarketing?: boolean;
    acceptedNewsletter?: boolean;
  }) => {
    const response = await authAPI.register(data);
    if (response?.token && response?.user) {
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
    }
    return response;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithApple,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
