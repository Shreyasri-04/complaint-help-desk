import axios from 'axios';
import { ApiError } from '@/api/ApiError';
import { useAuthStore } from '@/stores/authStore';

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  // Fail hung requests instead of leaving the UI in a loading state forever.
  // Timeouts surface as ApiError (status 0) with a friendly message.
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attaches the stored JWT as `Authorization: Bearer …`
// on every call, so services never handle tokens themselves. Reads state via
// getState() (no hook) because interceptors run outside React rendering.
httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let redirectingToLogin = false;

// Response interceptor: normalizes every failure to ApiError, and treats 401
// as an expired/invalid session — clears the store and hard-redirects to
// /login. The flag prevents redirect loops when several requests fail at once.
httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = ApiError.from(error);

    if (apiError.status === 401 && !redirectingToLogin) {
      redirectingToLogin = true;
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(apiError);
  },
);