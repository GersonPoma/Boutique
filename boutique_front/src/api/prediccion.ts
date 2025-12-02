import type { PrediccionResponse } from "../types/prediccion";
import { apiClient } from "./client";

export const getPrediccion = (
    fecha_inicio: string | null, fecha_fin: string | null, genero: string | null,
    marca: string | null, tipoPrenda: string | null, top_n: number | null
) => {
    return apiClient.get<PrediccionResponse>('ia/prediccion', {
        params: {
            fecha_inicio, fecha_fin, genero, marca, tipoPrenda, top_n
        }
    });
};