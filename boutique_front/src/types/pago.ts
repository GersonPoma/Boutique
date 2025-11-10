import type { Cuota } from "./cuota";
import type { Venta } from "./venta";

export enum MetodoPago {
    EFECTIVO = 'EFECTIVO',
    TARJETA = 'TARJETA',
    QR = 'QR',
}

export enum EstadoPago {
    PENDIENTE = 'PENDIENTE',
    COMPLETADO = 'COMPLETADO',
    FALLIDO = 'FALLIDO',
}

export interface Pago {
    id: number | null;
    fecha: string;
    hora: string;
    metodoPago: MetodoPago;
    monto: number;
    pagoDe: string | null;
    estado: EstadoPago | null;
    idVenta: number | null;
    idCuota: number | null;
}

export interface PagoDetalle {
    id: number;
    fecha: string;
    hora: string;
    metodoPago: MetodoPago;
    monto: number;
    pagoDe: string;
    estado: EstadoPago;
    venta: Venta | null;
    cuota: Cuota | null;
}
