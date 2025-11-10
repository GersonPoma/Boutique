export enum Frecuencia {
    SEMANAL = 'SEMANAL',
    QUINCENAL = 'QUINCENAL',
    MENSUAL = 'MENSUAL',
}

export interface PlanCredito {
    id: number;
    nombre: string;
    descripcion: string;
    plazo: number;
    frecuencia: Frecuencia;
    interesAnual: number;
    activo: boolean;
}