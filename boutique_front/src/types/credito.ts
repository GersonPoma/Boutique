import type { Cuota } from "./cuota";
import type { PlanCredito } from "./plan_credito";

export interface Credito {
    id: number;
    montoTotal: number;
    montoCuota: number;
    numeroCuotas: number;
    cuotasPagadas: number;
    fechaInicio: Date;
    saldoPendiente: number;
    idVenta: number;
    planCredito: PlanCredito;
    cuotas: Cuota[];
}
