// src/api/reportes.ts
import type { AxiosResponse } from "axios";
import type { ReporteRequest } from "../types/reporte";
import { http } from "./http";
import { apiClient } from "./client";
import type { EstadisticasVentas } from "../types/venta";

export const generarReporte = (data: ReporteRequest): Promise<AxiosResponse<Blob>> => {
  return http.post('/ia/reportes/generar/', data, {
    responseType: 'blob',
  });
}

export const estadisticaVentas = (idSucursal: number | undefined) => {
  return apiClient.get<EstadisticasVentas[]>('/api/reporte/estadisticas-ventas-mensuales', {
    params: { idSucursal }
  });
}