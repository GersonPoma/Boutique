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
import { Catalogo } from '../pages/catalogo/Catalogo';
import { Carrito } from '../pages/carrito/Carrito';
import { MisCompras } from '../pages/cliente/MisCompras';
import { Registro } from '../pages/registro/Registro';
import { Checkout } from '../pages/checkout/Checkout';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Catalogo />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      
      {/* Rutas protegidas para clientes (sin sidebar) */}
      <Route
        path="/mis-compras"
        element={
          <ProtectedRoute>
            <MisCompras />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      
      {/* Rutas protegidas con MainLayout (sidebar) */}
      <Route
        path="/dashboard"
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
