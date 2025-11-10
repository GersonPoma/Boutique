import type { Rol, User } from "../types/usuario";

export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

type Claims = { id?: number; rol?: Rol; id_sucursal?: number };

export function getUserFromToken(token: string | null): User | null {
  if (!token) return null;
  const c = decodeJWT(token) as Claims | null;
  if (!c?.id || !c?.rol) return null;
  return { id: c.id, rol: c.rol, id_sucursal: c.id_sucursal };
}
