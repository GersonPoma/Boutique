package com.boutique.controller;

import com.boutique.entity.dto.PaginacionDto;
import com.boutique.entity.dto.PagoDetalleDto;
import com.boutique.entity.dto.PagoSimpleDto;
import com.boutique.service.PagoService;
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
@RequestMapping("/api/pagos")
public class PagoController {
    @Autowired
    private PagoService service;

    @GetMapping
    public ResponseEntity<PaginacionDto<PagoSimpleDto>> listarPagos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction sortDirection = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<PagoSimpleDto> pagosPage = this.service.listarPagos(pageable);
        return ResponseEntity.ok(
                PaginacionDto.fromPage(pagosPage)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoDetalleDto> obtenerPagoPorId(
            @PathVariable Long id
    ) {
        PagoDetalleDto pago = this.service.obtenerPagoPorId(id);
        return ResponseEntity.ok(pago);
    }

    @PostMapping("/pago-venta")
    public ResponseEntity<PagoSimpleDto> crearPagoVenta(
            @RequestBody PagoSimpleDto nuevoPago
    ) {
        PagoSimpleDto pagoCreado = this.service.crearPagoVenta(nuevoPago);
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoCreado);
    }

    @PostMapping("/pago-cuota")
    public ResponseEntity<PagoSimpleDto> crearPagoCuota(
            @RequestBody PagoSimpleDto nuevoPago
    ) {
        PagoSimpleDto pagoCreado = this.service.crearPagoCuota(nuevoPago);
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoCreado);
    }
}
