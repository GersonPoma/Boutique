package com.boutique.controller;

import com.boutique.entity.dto.ProductoDto;
import com.boutique.entity.enums.*;
import com.boutique.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author GERSON
 */

@RestController
@RequestMapping("api/productos")
public class ProductoController {
    @Autowired
    private ProductoService service;

    @GetMapping
    public ResponseEntity<List<ProductoDto>> listarProductos() {
        List<ProductoDto> productos = service.listarProductos();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/obtener-nombre/{id}")
    public ResponseEntity<String> obtenerNombreProductoPorId(
            @PathVariable Long id
    ) {
        String nombreProducto = service.obtenerNombreProductoPorId(id);
        return ResponseEntity.ok(nombreProducto);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoDto>> buscarProductos(
            @RequestParam(name = "marca", required = false) Marca marca,
            @RequestParam(name = "genero", required = false) Genero genero,
            @RequestParam(name = "tipoPrenda", required = false) TipoPrenda tipoPrenda,
            @RequestParam(name = "talla", required = false) Talla talla,
            @RequestParam(name = "temporada", required = false) Temporada temporada,
            @RequestParam(name = "uso", required = false) Uso uso
    ) {
        List<ProductoDto> productos = service.buscarProductos(
                marca, genero, tipoPrenda, talla, temporada, uso
        );
        return ResponseEntity.ok(productos);
    }

    @PostMapping
    public ResponseEntity<ProductoDto> guardarProducto(
            @RequestBody ProductoDto nuevoProducto
    ) {
        ProductoDto productoGuardado = service.guardarProducto(nuevoProducto);
        return ResponseEntity.ok(productoGuardado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDto> obtenerProductoPorId(
            @PathVariable Long id
    ) {
        ProductoDto producto = service.obtenerProductoPorId(id);
        return ResponseEntity.ok(producto);
    }

    @GetMapping("obtener-precio/{id}")
    public ResponseEntity<BigDecimal> obtenerPrecioProductoPorId(
            @PathVariable Long id
    ) {
        BigDecimal precio = service.obtenerPrecioProductoPorId(id);
        return ResponseEntity.ok(precio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDto> actualizarProducto(
            @PathVariable Long id,
            @RequestBody ProductoDto productoActualizado
    ) {
        ProductoDto producto = service.actualizarProducto(id, productoActualizado);
        return ResponseEntity.ok(producto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(
            @PathVariable Long id
    ) {
        service.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }
}
