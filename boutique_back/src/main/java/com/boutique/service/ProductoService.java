package com.boutique.service;

import com.boutique.entity.dto.ProductoDto;
import com.boutique.entity.enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author GERSON
 */

public interface ProductoService {
    Page<ProductoDto> listarProductos(Pageable pageable);
    String obtenerNombreProductoPorId(Long id);
    Page<ProductoDto> buscarProductos(
            Marca marca,
            Genero genero,
            TipoPrenda tipoPrenda,
            Talla talla,
            Temporada temporada,
            Uso uso,
            Pageable pageable
    );
    ProductoDto guardarProducto(ProductoDto productoDto);
    ProductoDto obtenerProductoPorId(Long id);
    BigDecimal obtenerPrecioProductoPorId(Long id);
    ProductoDto actualizarProducto(Long id, ProductoDto productoDto);
    void eliminarProducto(Long id);
}
