import axios from 'axios';
import { setTokens, loadTokens, loadRefreshToken, clearTokens, getTokens } from '@/providers/service/auth/tokenStore';
import { logoutAndDisconnect } from './service/auth/logoutAndDisconnect';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  if (!config.headers['x-request-id']) {
    config.headers['x-request-id'] = generateRequestId();
  }
  const token = await loadTokens();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// No window.crypto in RN. expo-crypto's randomUUID works on modern Expo
// SDKs; this falls back to a timestamp+random id if it's ever unavailable.
const generateRequestId = () => {
  try {
    const Crypto = require('expo-crypto');
    if (Crypto?.randomUUID) return Crypto.randomUUID();
  } catch {
    // fall through to the manual id below
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

let isRefreshing = false;
let pendingQueue: Array<{ resolve: () => void; reject: (err: any) => void }> = [];

const runPendingQueue = () => {
  pendingQueue.forEach((p) => p.resolve());
  pendingQueue = [];
};

const rejectPendingQueue = (err: any) => {
  pendingQueue.forEach((p) => p.reject(err));
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: () => api(originalRequest).then(resolve).catch(reject),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await loadRefreshToken();
        if (!refreshToken) throw new Error('No refresh token stored');

        const refreshRes = await axios.get(
          `${API_URL}refreshToken/getRefreshToken`,
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        );
        const newAccessToken = refreshRes.data?.accessToken;
        if (!newAccessToken) throw new Error('Refresh response had no token');

        await setTokens(newAccessToken);

        isRefreshing = false;
        runPendingQueue();

        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        rejectPendingQueue(err);
        await logoutAndDisconnect(); 
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;