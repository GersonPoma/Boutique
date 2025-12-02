import type { Credito } from "./credito";

export enum TipoVenta {
    FISICA = 'FISICA',
    ONLINE = 'ONLINE',
}

export enum TipoPago {
    CONTADO = 'CONTADO',
    CREDITO = 'CREDITO',
}

export enum EstadoVenta {
    PENDIENTE = 'PENDIENTE',
    COMPLETADA = 'COMPLETADA',
    CANCELADA = 'CANCELADA',
    EN_PROCESO = 'EN_PROCESO',
    PAGANDO_CREDITO = 'PAGANDO_CREDITO',
}

export interface Venta {
    id: number;
    fecha: Date;
    hora: Date;
    total: number;
    tipoVenta: TipoVenta;
    tipoPago: TipoPago;
    estado: EstadoVenta;
    clienteNombre: string;
}

export interface VerDetallesVenta {
    id: number | null;
    fecha: string;
    hora: string;
    total: number;
    tipoVenta: TipoVenta;
    tipoPago: TipoPago;
    estado: EstadoVenta | null;
    observaciones: string | null;
    idCliente: number,
    clienteNombre: string | null;
    idSucursal: number;
    sucursalNombre: string | null;
    detalles: DetalleVenta[];
    credito: Credito | null;
    idPlanCredito: number | null;
}

export interface DetalleVenta {
    id: number | null;
    cantidad: number;
    precioUnitario: number;
    subTotal: number;
    idVenta: number | null;
    idProducto: number;
    nombreProducto: string | null;
    imagenUrl: string | null;
}