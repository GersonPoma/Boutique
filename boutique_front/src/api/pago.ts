import type { PageResponse } from "../types/pagination";
import type { Pago, PagoDetalle } from "../types/pago";
import { apiClient } from "./client";

export const crearPago = (pago: Partial<Pago>) => 
    apiClient.post<Pago>('/pagos/pago-venta', pago);

export const getPagos = (page: number) =>
    apiClient.get<PageResponse<Pago>>('/pagos', {
        params: { page }
    });

export const getPagoPorId = (id: number) =>
    apiClient.get<PagoDetalle>(`/pagos/${id}`);