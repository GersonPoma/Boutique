import type { Cliente } from "../types/cliente";
import { apiClient } from "./client";

export const getClienteByCi = (ci: string) =>
  apiClient.get<Cliente>(`api/clientes/${ci}`);

export const crearCliente = (cliente: Partial<Cliente>) =>
  apiClient.post<Cliente>('api/clientes', cliente);