export interface Inventario {
    id: number | null;
    cantidad: number;
    idSucursal: number;
    idProducto: number;
    nombreSucursal: string | null;
    nombreProducto: string | null;
    imagenUrl: string | null;
}