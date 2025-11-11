import { apiClient } from "./client";

export const getNombreProducto = (idProducto: number) => {
    return apiClient.get<string>(`api/productos/obtener-nombre/${idProducto}`);
}

export const getPrecioProducto = (idProducto: number) => {
    return apiClient.get<number>(`api/productos/obtener-precio/${idProducto}`);
}