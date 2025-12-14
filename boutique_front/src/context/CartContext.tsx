import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Producto } from "../types/producto";

export interface ItemCarrito extends Producto {
    cantidad: number;
}

interface CarritoContextType {
  carrito: ItemCarrito[];
  agregarAlCarrito: (producto: Producto) => void;
  eliminarDelCarrito: (productoId: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  limpiarCarrito: () => void;
  total: number;
  cantidad: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => {
    // Inicializar desde localStorage
    const carritoGuardado = localStorage.getItem('carrito-compras');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

  useEffect(() => {
    localStorage.setItem('carrito-compras', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id);
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const eliminarDelCarrito = (productoId: number) => {
    setCarrito((prev) => prev.filter((item) => item.id !== productoId));
  };

  const actualizarCantidad = (productoId: number, cantidad: number) => {
    if (cantidad < 1) return;
    setCarrito((prev) =>
      prev.map((item) => (item.id === productoId ? { ...item, cantidad } : item))
    );
  };

  const limpiarCarrito = () => setCarrito([]);

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const cantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CarritoContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, limpiarCarrito, total, cantidad }}>
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return context;
};