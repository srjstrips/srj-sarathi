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
          const { data: loginResp } = await api.post('/auth/login', { username: identifier, password });
          const tokens = loginResp.data ?? loginResp;
          localStorage.setItem('access_token',  tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
          set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
          // fetch user profile with the new token
          const { data: meResp } = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });
          const me = meResp.data ?? meResp;
          const mapped: AuthUser = {
            id:          me.id,
            email:       me.email,
            name:        me.employee
              ? `${me.employee.firstName} ${me.employee.lastName}`.trim()
              : me.username,
            role:        me.roles?.[0] ?? 'EMPLOYEE',
            permissions: me.permissions ?? [],
            companyId:   me.employee?.companyId ?? '',
            departmentId: me.employee?.departmentId,
            employeeId:  me.employee?.id,
            avatar:      me.employee?.profilePicUrl,
          };
          set({ user: mapped, isLoading: false });
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
          const { data: meResp } = await api.get('/auth/me');
          const me = meResp.data ?? meResp;
          const mapped: AuthUser = {
            id:          me.id,
            email:       me.email,
            name:        me.employee
              ? `${me.employee.firstName} ${me.employee.lastName}`.trim()
              : me.username,
            role:        me.roles?.[0] ?? 'EMPLOYEE',
            permissions: me.permissions ?? [],
            companyId:   me.employee?.companyId ?? '',
            departmentId: me.employee?.departmentId,
            employeeId:  me.employee?.id,
            avatar:      me.employee?.profilePicUrl,
          };
          set({ user: mapped, isInitialized: true });
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
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }),
    },
  ),
);
