import type { Sucursal } from "../types/sucursal";
import { apiClient } from "./client";

export const getSucursales = () =>
  apiClient.get<Sucursal[]>('/sucursales');