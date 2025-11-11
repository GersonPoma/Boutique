import axios from 'axios';
import { getAccessToken, clearTokens } from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/';

export const http = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 segundos (aumentado para reportes con IA)
});

let onUnauthorized: (() => void) | null = null;
export const setOnUnauthorized = (cb: () => void) => (onUnauthorized = cb);

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearTokens();
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);
