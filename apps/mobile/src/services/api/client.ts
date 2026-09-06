import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from store on every request
apiClient.interceptors.request.use((config) => {
  // Token injection handled by auth store — imported lazily to avoid circular deps
  const { useAuthStore } = require('../../store/auth.store');
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// 401 handling — trigger refresh or logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = require('../../store/auth.store');
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  },
);
