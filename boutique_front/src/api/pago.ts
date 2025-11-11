import type { PageResponse } from "../types/pagination";
import type { Pago, PagoDetalle } from "../types/pago";
import { apiClient } from "./client";

export const crearPago = (pago: Partial<Pago>) => 
    apiClient.post<Pago>('api/pagos/pago-venta', pago);

export const getPagos = (page: number) =>
    apiClient.get<PageResponse<Pago>>('api/pagos', {
        params: { page }
    });

export const getPagoPorId = (id: number) =>
    apiClient.get<PagoDetalle>(`api/pagos/${id}`);