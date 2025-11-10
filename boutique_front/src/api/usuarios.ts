import { apiClient } from './client';
import type { Usuario, CrearUsuario } from '../types/usuario';
import type { PageResponse } from '../types/pagination';

// Obtener usuarios con paginación
export const getUsuarios = (page = 0) =>
  apiClient.get<PageResponse<Usuario>>(`/usuarios?page=${page}`);
export const getUsuarioById = (id: string) => apiClient.get<Usuario>(`/usuarios/${id}`);
export const createUsuario = (data: CrearUsuario) => apiClient.post<Usuario>('/usuarios', data);
export const updateUsuario = (id: string, data: Partial<CrearUsuario>) =>
  apiClient.put<Usuario>(`/usuarios/${id}`, data);
export const deleteUsuario = (id: string) => apiClient.delete<void>(`/usuarios/${id}`);
