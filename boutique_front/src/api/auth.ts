import { apiClient } from './client';
import type { LoginResponse } from '../types/auth';
    
export const login = (username: string, password: string) =>
  apiClient.post<LoginResponse>('/auth/login', { username, password });
