export interface Cuota {
    id: number;
    numero: number;
    monto: number;
    fechaVencimiento: Date;
    fechaPago: Date | null;
    pagada: boolean;
    idCredito: number;
}