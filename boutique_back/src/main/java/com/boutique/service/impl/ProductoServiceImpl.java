package com.boutique.service.impl;

import com.boutique.entity.Producto;
import com.boutique.entity.dto.ProductoDto;
import com.boutique.entity.enums.*;
import com.boutique.repository.ProductoRepository;
import com.boutique.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author GERSON
 */

@Service
@Transactional
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductoDto> listarProductos(Pageable pageable) {
        return this.repository.findAll(pageable)
                .map(ProductoDto::toDto);
    }

    @Override
    public String obtenerNombreProductoPorId(Long id) {
        Producto producto = getProductoById(id);
        return producto.getNombre();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductoDto> buscarProductos(
            Marca marca, Genero genero, TipoPrenda tipoPrenda,
            Talla talla, Temporada temporada, Uso uso,
            Pageable pageable
    ) {
        return this.repository.buscar(
                marca, genero, tipoPrenda, talla, temporada, uso, pageable
                ).map(ProductoDto::toDto);
    }

    @Override
    @Transactional
    public ProductoDto guardarProducto(ProductoDto productoDto) {
        return ProductoDto.toDto(
                this.repository.save(
                        ProductoDto.toEntity(productoDto)
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoDto obtenerProductoPorId(Long id) {
        Producto producto = getProductoById(id);
        return ProductoDto.toDto(producto);
    }

    @Override
    public BigDecimal obtenerPrecioProductoPorId(Long id) {
        Producto producto = getProductoById(id);
        return producto.getPrecio();
    }

    @Override
    @Transactional
    public ProductoDto actualizarProducto(Long id, ProductoDto productoDto) {
        Producto productoExistente = getProductoById(id);
        Producto productoActualizado = ProductoDto.toEntity(productoDto);
        productoActualizado.setId(productoExistente.getId());
        return ProductoDto.toDto(
                this.repository.save(productoActualizado)
        );
    }

    @Override
    @Transactional
    public void eliminarProducto(Long id) {
        this.repository.deleteById(id);
    }

    private Producto getProductoById(Long id) {
        return this.repository.findById(id).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Producto con ID " + id + " no encontrado."
        ));
    }
}
