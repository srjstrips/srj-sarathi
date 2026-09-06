import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

export interface AuthUser {
  id:          string;
  email:       string;
  employeeId?: string;
  name:        string;
  avatar?:     string;
  role:        string;
  permissions: string[];
  companyId:   string;
  departmentId?: string;
}

interface AuthState {
  user:         AuthUser | null;
  accessToken:  string | null;
  refreshToken: string | null;
  isLoading:    boolean;
  isInitialized: boolean;

  login:       (identifier: string, password: string) => Promise<void>;
  logout:      () => Promise<void>;
  initialize:  () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:          null,
      accessToken:   null,
      refreshToken:  null,
      isLoading:     false,
      isInitialized: false,

      login: async (identifier, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { identifier, password });
          localStorage.setItem('access_token',  data.accessToken);
          localStorage.setItem('refresh_token', data.refreshToken);
          set({
            accessToken:  data.accessToken,
            refreshToken: data.refreshToken,
            user:         data.user,
            isLoading:    false,
          });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch { /* ignore */ }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, accessToken: null, refreshToken: null });
        window.location.href = '/login';
      },

      initialize: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) { set({ isInitialized: true }); return; }
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data, isInitialized: true });
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ user: null, isInitialized: true });
        }
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes(permission);
      },
    }),
    {
      name:    'srj-sarthi-auth',
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }),
    },
  ),
);
