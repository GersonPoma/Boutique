// src/api/reportes.ts
import type { AxiosResponse } from "axios";
import type { ReporteRequest } from "../types/reporte";
import { http } from "./http";

// 1. Generar reporte de Productos
export const generarReporteProductos = (
  data: ReporteRequest
): Promise<AxiosResponse<Blob>> => {
  // <--- Devolvemos la respuesta completa de Axios
  return http.post('/ia/reportes/productos/', data, {
    responseType: 'blob', // <--- IMPORTANTE: Pedimos la respuesta como un archivo
  });
};

// 2. Generar reporte de Ventas
export const generarReporteVentas = (
  data: ReporteRequest
): Promise<AxiosResponse<Blob>> => {
  // <--- Devolvemos la respuesta completa de Axios
  return http.post('/ia/reportes/ventas/', data, {
    responseType: 'blob', // <--- IMPORTANTE: Pedimos la respuesta como un archivo
  });
};