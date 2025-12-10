package com.boutique.controller;

import com.boutique.entity.dto.PaginacionDto;
import com.boutique.entity.dto.ProductoDto;
import com.boutique.entity.enums.*;
import com.boutique.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author GERSON
 */

@RestController
@RequestMapping("api/catalogo")
public class CatalogoController {
    @Autowired
    private ProductoService service;

    @GetMapping
    public ResponseEntity<PaginacionDto<ProductoDto>> obtenerCatalogo(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<ProductoDto> pageResult = this.service.listarProductos(pageable);
        return ResponseEntity.ok(PaginacionDto.fromPage(pageResult));
    }

    @GetMapping("/buscar")
    public ResponseEntity<PaginacionDto<ProductoDto>> buscarProductos(
            @RequestParam(required = false) Marca marca,
            @RequestParam(required = false) Genero genero,
            @RequestParam(required = false) TipoPrenda tipoPrenda,
            @RequestParam(required = false) Talla talla,
            @RequestParam(required = false) Temporada temporada,
            @RequestParam(required = false) Uso uso,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<ProductoDto> productos = this.service.buscarProductos(
                marca, genero, tipoPrenda, talla, temporada, uso, pageable
        );
        return ResponseEntity.ok(PaginacionDto.fromPage(productos));
    }
}
