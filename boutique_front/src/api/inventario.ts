import type { Inventario } from "../types/inventario";
import type { PageResponse } from "../types/pagination";
import { apiClient } from "./client";

export const getInventarios = (page = 0) =>
  apiClient.get<PageResponse<Inventario>>(`api/inventarios?page=${page}`);
export const getInventariosBySucursal = (idSucursal: number, page = 0) =>
  apiClient.get<PageResponse<Inventario>>(
    `api/inventarios/sucursal/${idSucursal}?page=${page}`
  );
export const getInventarioById = (id: number) => apiClient.get<Inventario>(`api/inventarios/${id}`);
export const createInventario = (data: Partial<Inventario>) => apiClient.post<Inventario>('api/inventarios', data);
export const updateInventario = (id: number, data: Partial<Inventario>) =>
  apiClient.put<Inventario>(`api/inventarios/${id}`, data);
export const deleteInventario = (id: number) => apiClient.delete<void>(`api/inventarios/${id}`);