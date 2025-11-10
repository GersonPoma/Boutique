import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();
  return accessToken ? children : <Navigate to="/login" replace />;
};
