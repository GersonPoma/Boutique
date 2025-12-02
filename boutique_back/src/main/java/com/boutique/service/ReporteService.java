package com.boutique.service;

import com.boutique.entity.dto.ProductoVendidoDTO;
import com.boutique.entity.dto.ProductoVentaMesDto;
import com.boutique.entity.dto.VentaEstadisticaDto;
import com.boutique.entity.dto.VentaSimpleDto;
import com.boutique.entity.enums.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * @author GERSON
 */

public interface ReporteService {
    List<VentaSimpleDto> generarReporteVentas(
            BigDecimal montoMinimo, BigDecimal montoMaximo, TipoPago tipoPago,
            EstadoVenta estadoVenta, LocalDate desde, LocalDate hasta, TipoVenta tipoVenta
    );

    List<ProductoVendidoDTO> generarReporteProductosVendidos(
            LocalDate desde,
            LocalDate hasta,
            Marca marca,
            Genero genero,
            TipoPrenda tipoPrenda,
            Talla talla,
            Temporada temporada,
            Estilo estilo,
            Material material,
            Uso uso,
            TipoVenta tipoVenta,
            TipoPago tipoPago,
            EstadoVenta estadoVenta,
            String ordenarPor,
            String orden,
            Integer limite
    );

    List<ProductoVentaMesDto> generarReporteProductosMensual(
            LocalDate desde,
            LocalDate hasta
    );

    List<VentaEstadisticaDto> obtenerEstadisticasVentasMensuales();
}
