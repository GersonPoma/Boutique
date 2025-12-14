export enum Rol {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE',
  GERENTE = 'GERENTE',
  VENDEDOR = 'VENDEDOR',
  CAJERO = 'CAJERO',
  INVENTARISTA = 'INVENTARISTA',
}

export interface Usuario {
  id: string;
  username: string;
  rol: Rol;
}

export interface CrearUsuario {
  username: string;
  password: string;
  rol: Rol;
}

export interface User {
  id: number;
  username?: string;
  rol: Rol;
  id_sucursal?: number;
}
