import type { Cliente } from "../types/cliente";
import { apiClient } from "./client";

export interface RegistroCliente {
  ci: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  username: string;
  password: string;
}

export const getClienteByCi = (ci: string) =>
  apiClient.get<Cliente>(`api/clientes/${ci}`);

export const crearCliente = (cliente: Partial<Cliente>) =>
  apiClient.post<Cliente>('api/clientes', cliente);

export const registrarClienteConUsuario = (data: RegistroCliente) =>
  apiClient.post<void>('api/clientes/con-usuario', data);