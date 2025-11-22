// src/api/reportes.ts
import type { AxiosResponse } from "axios";
import type { ReporteRequest } from "../types/reporte";
import { http } from "./http";

export const generarReporte = (data: ReporteRequest): Promise<AxiosResponse<Blob>> => {
  return http.post('/ia/reportes/generar/', data, {
    responseType: 'blob',
  });
}