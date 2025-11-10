import { apiClient } from "./client";

export const getNombreProducto = (idProducto: number) => {
    return apiClient.get<string>(`/productos/obtener-nombre/${idProducto}`);
}

export const getPrecioProducto = (idProducto: number) => {
    return apiClient.get<number>(`/productos/obtener-precio/${idProducto}`);
}