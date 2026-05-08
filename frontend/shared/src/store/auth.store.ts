import { create } from 'zustand';
import { User } from '../types';
import { authApi, RegisterData, LoginData } from '../api/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const initializeAuth = (set: any) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nce_access_token') : null;
  set({
    accessToken: token,
    isAuthenticated: !!token,
  });
};

export const useAuthStore = create<AuthState>((set) => {
  // 初始化
  if (typeof window !== 'undefined') {
    initializeAuth(set);
  }

  return {
    user: null,
    accessToken: typeof window !== 'undefined' ? localStorage.getItem('nce_access_token') : null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('nce_access_token') : false,
    isLoading: false,
    error: null,

    login: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.login(data);
        localStorage.setItem('nce_access_token', response.accessToken);
        set({
          user: response.user,
          accessToken: response.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Login failed',
          isLoading: false,
        });
      }
    },

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.register(data);
        localStorage.setItem('nce_access_token', response.accessToken);
        set({
          user: response.user,
          accessToken: response.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Registration failed',
          isLoading: false,
        });
      }
    },

    logout: () => {
      localStorage.removeItem('nce_access_token');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    },

    clearError: () => set({ error: null }),
  };
});
