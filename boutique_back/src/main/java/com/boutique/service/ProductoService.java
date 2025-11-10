package com.boutique.service;

import com.boutique.entity.dto.ProductoDto;
import com.boutique.entity.enums.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author GERSON
 */

public interface ProductoService {
    List<ProductoDto> listarProductos();
    String obtenerNombreProductoPorId(Long id);
    List<ProductoDto> buscarProductos(
            Marca marca,
            Genero genero,
            TipoPrenda tipoPrenda,
            Talla talla,
            Temporada temporada,
            Uso uso
    );
    ProductoDto guardarProducto(ProductoDto productoDto);
    ProductoDto obtenerProductoPorId(Long id);
    BigDecimal obtenerPrecioProductoPorId(Long id);
    ProductoDto actualizarProducto(Long id, ProductoDto productoDto);
    void eliminarProducto(Long id);
}
