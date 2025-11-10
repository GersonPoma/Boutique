package com.boutique.controller;

import com.boutique.entity.dto.PaginacionDto;
import com.boutique.entity.dto.VentaDetalleDto;
import com.boutique.entity.dto.VentaSimpleDto;
import com.boutique.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping("/api/ventas")
public class VentaController {
    @Autowired
    private VentaService service;

    @GetMapping("/completadas")
    public ResponseEntity<PaginacionDto<VentaSimpleDto>> listarVentasCompletadas(
            @RequestParam(name = "idSucursal", required = false) Long idSucursal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        return ResponseEntity.ok(
                PaginacionDto.fromPage(
                        this.service.listarVentasCompletadas(idSucursal, pageable))
        );
    }

    @GetMapping("/canceladas")
    public ResponseEntity<PaginacionDto<VentaSimpleDto>> listarVentasCanceladas(
            @RequestParam(name = "idSucursal", required = false) Long idSucursal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        return ResponseEntity.ok(
                PaginacionDto.fromPage(
                        this.service.listarVentasCanceladas(idSucursal, pageable))
        );
    }

    @GetMapping("/pendientes")
    public ResponseEntity<PaginacionDto<VentaSimpleDto>> listarVentasPendientes(
            @RequestParam(name = "idSucursal", required = false) Long idSucursal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        return ResponseEntity.ok(
                PaginacionDto.fromPage(
                        this.service.listarVentasPendientes(idSucursal, pageable))
        );
    }

    @GetMapping("/en-proceso")
    public ResponseEntity<PaginacionDto<VentaSimpleDto>> listarVentasEnProceso(
            @RequestParam(name = "idSucursal", required = false) Long idSucursal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        return ResponseEntity.ok(
                PaginacionDto.fromPage(
                        this.service.listarVentasEnProceso(idSucursal, pageable))
        );
    }

    @GetMapping("/pagando-credito")
    public ResponseEntity<PaginacionDto<VentaSimpleDto>> listarVentasPagandoCredito(
            @RequestParam(name = "idSucursal", required = false) Long idSucursal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        return ResponseEntity.ok(
                PaginacionDto.fromPage(
                        this.service.listarVentasPagandoCredito(idSucursal, pageable))
        );
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<PaginacionDto<VentaSimpleDto>> listarVentasPorCliente(
            @PathVariable Long idCliente,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        return ResponseEntity.ok(
                PaginacionDto.fromPage(
                        this.service.listarVentasPorCliente(idCliente, pageable))
        );
    }

    @PostMapping
    public ResponseEntity<VentaSimpleDto> crearVenta(
            @RequestBody VentaDetalleDto nuevaVenta) {
        VentaSimpleDto ventaCreada = this.service.crearVenta(nuevaVenta);
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaCreada);
    }

    @GetMapping("/{idVenta}")
    public ResponseEntity<VentaDetalleDto> obtenerDetalleVentaPorId(
            @PathVariable Long idVenta) {
        VentaDetalleDto detalleVenta = this.service.obtenerDetalleVentaPorId(idVenta);
        return ResponseEntity.ok(detalleVenta);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelarVenta(@PathVariable Long id) {
        this.service.canelarVenta(id);
        return ResponseEntity.noContent().build();
    }
}
