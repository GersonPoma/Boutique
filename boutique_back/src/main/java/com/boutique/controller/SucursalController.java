package com.boutique.controller;

import com.boutique.entity.dto.SucursalDto;
import com.boutique.service.SucursalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author GERSON
 */

@RestController
@RequestMapping("api/sucursales")
public class SucursalController {
    @Autowired
    private SucursalService sucursalService;

    @GetMapping
    public ResponseEntity<List<SucursalDto>> listarSucursales() {
        return ResponseEntity.ok(this.sucursalService.listarSucursales());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SucursalDto> obtenerSucursalPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(this.sucursalService.obtenerSucursalPorId(id));
    }

    @PostMapping
    public ResponseEntity<SucursalDto> crearSucursal(
            @RequestBody SucursalDto nuevaSucursal
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(this.sucursalService.crearSucursal(nuevaSucursal)
                );
    }

    @PutMapping("/{id}")
    public ResponseEntity<SucursalDto> actualizarSucursal(
            @PathVariable Long id,
            @RequestBody SucursalDto nuevaSucursal
    ) {
        return ResponseEntity.ok(
                this.sucursalService.actualizarSucursal(id, nuevaSucursal)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSucursal(
            @PathVariable Long id
    ) {
        this.sucursalService.eliminarSucursal(id);
        return ResponseEntity.ok().build();
    }
}
