import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  setTokens: (access: string, refresh: string, userId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  userId: null,
  setTokens: (accessToken, refreshToken, userId) => set({ accessToken, refreshToken, userId }),
  clearAuth: () => set({ accessToken: null, refreshToken: null, userId: null }),
}));
