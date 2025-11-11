import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from '../pages/login/Login';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { NotFound } from '../pages/not-found/NotFound';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Usuarios } from '../pages/usuarios/Usuarios';
import { Inventarios } from '../pages/inventarios/Inventarios';
import { Ventas } from '../pages/ventas/Ventas';
import { Pagos } from '../pages/pagos/Pagos';
import { Reportes } from '../pages/reportes/Reportes';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="inventario" element={<Inventarios />} />
        <Route path="venta" element={<Ventas />} />
        <Route path="pago" element={<Pagos />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
