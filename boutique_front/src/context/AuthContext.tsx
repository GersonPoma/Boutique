import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/storage';
import { login as apiLogin } from '../api/auth';
import { setOnUnauthorized } from '../api/http';
import { getUserFromToken } from '../utils/jwt';
import type { User } from '../types/usuario';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // lee tokens existentes
  const initialAccess = getAccessToken();
  const initialRefresh = getRefreshToken();

  // inicializa user en memoria directamente desde el token para evitar “flash”
  const [accessToken, setAccessToken] = useState<string | null>(initialAccess);
  const [refreshToken, setRefreshToken] = useState<string | null>(initialRefresh);
  const [user, setUser] = useState<User | null>(getUserFromToken(initialAccess));

  const login = async (username: string, password: string) => {
    // resp: { access_token, refresh_token }
    const { access_token, refresh_token } = await apiLogin(username, password);
    setAccessToken(access_token);
    setRefreshToken(refresh_token);
    const loggedUser = getUserFromToken(access_token);
    setUser(loggedUser);   // solo se decodifica aquí
    setTokens(access_token, refresh_token);
    return loggedUser!;
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  // cualquier 401 desde axios => logout
  useEffect(() => {
    setOnUnauthorized(logout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
