import type { AxiosRequestConfig } from 'axios';
import { http } from './http';

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await http.request<T>(config);
  return res.data;
}

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ url, method: 'GET', ...config }),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>({ url, method: 'POST', data, ...config }),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>({ url, method: 'PUT', data, ...config }),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>({ url, method: 'PATCH', data, ...config }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ url, method: 'DELETE', ...config }),
};
