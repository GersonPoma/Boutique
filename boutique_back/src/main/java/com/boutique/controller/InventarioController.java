package com.boutique.controller;

import com.boutique.entity.dto.InventarioDto;
import com.boutique.entity.dto.PaginacionDto;
import com.boutique.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author GERSON
 */

@RestController
@RequestMapping("/api/inventarios")
public class InventarioController {
    @Autowired
    private InventarioService service;

    @GetMapping
    public ResponseEntity<PaginacionDto<InventarioDto>> listarInventarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<InventarioDto> pageResult = service.listarInventario(pageable);
        return ResponseEntity.ok(PaginacionDto.fromPage(pageResult));
    }

    @GetMapping("/sucursal/{idSucursal}")
    public ResponseEntity<PaginacionDto<InventarioDto>> listarInventariosPorSucursal(
            @PathVariable Long idSucursal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<InventarioDto> inventarios = service.listarInventarioPorSucursal(
                idSucursal, pageable
        );
        return ResponseEntity.ok(PaginacionDto.fromPage(inventarios));
    }

    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<PaginacionDto<InventarioDto>> listarInventariosPorProducto(
            @PathVariable Long idProducto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<InventarioDto> inventarios = service.listarInventarioPorProducto(
                idProducto, pageable
        );
        return ResponseEntity.ok(PaginacionDto.fromPage(inventarios));
    }

    @GetMapping("stock-sucursal-producto")
    public ResponseEntity<Integer> obtenerStockPorSucursalYProducto(
            @RequestParam Long idSucursal,
            @RequestParam Long idProducto
    ) {
        Integer stock = this.service.getStockPorSucursalYProducto(idSucursal, idProducto);
        return ResponseEntity.ok(stock);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventarioDto> obtenerInventarioPorId(Long id) {
        InventarioDto inventario = service.obtenerInventarioPorId(id);
        return ResponseEntity.ok(inventario);
    }

    @PostMapping
    public ResponseEntity<InventarioDto> crearInventario(
            @RequestBody InventarioDto nuevoInventario
    ) {
        InventarioDto inventarioCreado = service.crearInventario(nuevoInventario);
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioCreado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventarioDto> actualizarInventario(
            @PathVariable Long id,
            @RequestBody InventarioDto inventarioDto
    ) {
        InventarioDto inventarioActualizado = service.actualizarInventario(id, inventarioDto);
        return ResponseEntity.ok(inventarioActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarInventario(@PathVariable Long id) {
        service.eliminarInventario(id);
        return ResponseEntity.noContent().build();
    }
}
