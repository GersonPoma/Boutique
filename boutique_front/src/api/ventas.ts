import type { PageResponse } from "../types/pagination";
import type { Venta, VerDetallesVenta } from "../types/venta";
import { apiClient } from "./client";

export const getVentasCompletadas = (page = 0, idSucursal: number | null) =>
  apiClient.get<PageResponse<Venta>>(`api/ventas/completadas?page=${page}&idSucursal=${idSucursal ?? ''}`);

export const getVentasPendientes = (page = 0, idSucursal: number | null) =>
  apiClient.get<PageResponse<Venta>>(`api/ventas/pendientes?page=${page}&idSucursal=${idSucursal ?? ''}`);

export const getVentasEnProceso = (page = 0, idSucursal: number | null) =>
  apiClient.get<PageResponse<Venta>>(`api/ventas/en-proceso?page=${page}&idSucursal=${idSucursal ?? ''}`);

export const getVentasPagandoCredito = (page = 0, idSucursal: number | null) =>
  apiClient.get<PageResponse<Venta>>(`api/ventas/pagando-credito?page=${page}&idSucursal=${idSucursal ?? ''}`);

export const getVentasCanceladas = (page = 0, idSucursal: number | null) =>
    apiClient.get<PageResponse<Venta>>(`api/ventas/canceladas?page=${page}&idSucursal=${idSucursal ?? ''}`);

export const getVentaById = (id: number) =>
  apiClient.get<VerDetallesVenta>(`api/ventas/${id}`);

export const deleteVenta = (id: number) =>
  apiClient.delete<void>(`api/ventas/${id}`);

export const crearVenta = (venta: Partial<VerDetallesVenta>) =>
  apiClient.post<VerDetallesVenta>(`api/ventas`, venta);