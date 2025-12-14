import type { Producto, Marca, Genero, TipoPrenda, Talla, Temporada, Uso } from "../types/producto";
import type { PageResponse } from "../types/pagination";
import { apiClient } from "./client";

export const getCatalogo = (page = 0) =>
  apiClient.get<PageResponse<Producto>>(`api/catalogo?page=${page}`);

interface BuscarCatalogoParams {
  marca?: Marca;
  genero?: Genero;
  tipoPrenda?: TipoPrenda;
  talla?: Talla;
  temporada?: Temporada;
  uso?: Uso;
  page?: number;
}

export const buscarCatalogo = (params: BuscarCatalogoParams) => {
  const queryParams = new URLSearchParams();
  
  if (params.marca) queryParams.append('marca', params.marca);
  if (params.genero) queryParams.append('genero', params.genero);
  if (params.tipoPrenda) queryParams.append('tipoPrenda', params.tipoPrenda);
  if (params.talla) queryParams.append('talla', params.talla);
  if (params.temporada) queryParams.append('temporada', params.temporada);
  if (params.uso) queryParams.append('uso', params.uso);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());

  return apiClient.get<PageResponse<Producto>>(`api/catalogo/buscar?${queryParams.toString()}`);
};

export const getStockProducto = (idSucursal: number, idProducto: number) =>
  apiClient.get<number>(`api/inventarios/stock-sucursal-producto?idSucursal=${idSucursal}&idProducto=${idProducto}`);
