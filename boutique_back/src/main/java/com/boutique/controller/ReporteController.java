package com.boutique.controller;

import com.boutique.entity.dto.ProductoVendidoDTO;
import com.boutique.entity.dto.ProductoVentaMesDto;
import com.boutique.entity.dto.VentaSimpleDto;
import com.boutique.entity.enums.*;
import com.boutique.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * @author GERSON
 */

@RestController
@RequestMapping("api/reporte")
public class ReporteController {
    @Autowired
    private ReporteService service;

    @GetMapping("/ventas")
    public ResponseEntity<List<VentaSimpleDto>> generarReporteVentas(
            @RequestParam(required = false) BigDecimal montoMinimo,
            @RequestParam(required = false) BigDecimal montoMaximo,
            @RequestParam(required = false) TipoPago tipoPago,
            @RequestParam(required = false) EstadoVenta estadoVenta,
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta,
            @RequestParam(required = false) TipoVenta tipoVenta
    ) {
        List<VentaSimpleDto> reporte = this.service.generarReporteVentas(
                montoMinimo, montoMaximo, tipoPago, estadoVenta, desde, hasta, tipoVenta
        );
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/productos")
    public ResponseEntity<List<ProductoVendidoDTO>> obtenerProductosMasVendidos(
            @RequestParam("desde")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,

            @RequestParam("hasta")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,

            @RequestParam(value = "marca", required = false) Marca marca,
            @RequestParam(value = "genero", required = false) Genero genero,
            @RequestParam(value = "tipoPrenda", required = false) TipoPrenda tipoPrenda,
            @RequestParam(value = "talla", required = false) Talla talla,
            @RequestParam(value = "temporada", required = false) Temporada temporada,
            @RequestParam(value = "estilo", required = false) Estilo estilo,
            @RequestParam(value = "material", required = false) Material material,
            @RequestParam(value = "uso", required = false) Uso uso,
            @RequestParam(value = "tipoVenta", required = false) TipoVenta tipoVenta,
            @RequestParam(value = "tipoPago", required = false) TipoPago tipoPago,
            @RequestParam(value = "estadoVenta", required = false) EstadoVenta estadoVenta,
            @RequestParam(value = "ordenarPor", defaultValue = "cantidadVendida") String ordenarPor,
            @RequestParam(value = "orden", defaultValue = "DESC") String orden,
            @RequestParam(value = "limite", defaultValue = "10") Integer limite
    ) {
        List<ProductoVendidoDTO> productos = this.service.generarReporteProductosVendidos(
                desde, hasta, marca, genero, tipoPrenda, talla, temporada, estilo,
                material, uso, tipoVenta, tipoPago, estadoVenta, ordenarPor, orden, limite
        );

        return ResponseEntity.ok(productos);
    }

    @GetMapping("/productos-mes")
    public ResponseEntity<List<ProductoVentaMesDto>> obtenerProductosMes(
            @RequestParam("desde")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,

            @RequestParam("hasta")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        List<ProductoVentaMesDto> productos = this.service.generarReporteProductosMensual(
                desde, hasta
        );
        return ResponseEntity.ok(productos);
    }
}
