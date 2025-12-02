export interface PeridoPrediccion {
    inicio: string; // Fecha de inicio en formato ISO
    fin: string;    // Fecha de fin en formato ISO
}

export interface ResumenPrediccion {
    mensaje: string;
    peridodoPrediccion: PeridoPrediccion;
    totalUnidadesPredichas: number;
    totalIngresoPredicho: number;
    totalProductosPredichos: number;
}

export interface ProductoPrediccion {
    productoId: number;
    productoNombre: string;
    marca: string | null;
    precio: number;
    cantidadPredicha: number;
    confianza: number;
    ventasHistoricas: number;
    ranking: number;
    genero: string | null;
    tipoPrenda: string | null;
    temporada: string | null;
}

export interface PrediccionResponse {
    resumen: ResumenPrediccion;
    resultados: ProductoPrediccion[];
}