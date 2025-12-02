package com.boutique.service.impl;

import com.boutique.entity.Venta;
import com.boutique.entity.dto.ProductoVendidoDTO;
import com.boutique.entity.dto.ProductoVentaMesDto;
import com.boutique.entity.dto.VentaEstadisticaDto;
import com.boutique.entity.dto.VentaSimpleDto;
import com.boutique.entity.enums.*;
import com.boutique.repository.ProductoRepository;
import com.boutique.repository.VentaRepository;
import com.boutique.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author GERSON
 */

@Service
public class ReporteServiceImpl implements ReporteService {
    @Autowired
    private VentaRepository ventaRepository;
    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public List<VentaSimpleDto> generarReporteVentas(
            BigDecimal montoMinimo, BigDecimal montoMaximo, TipoPago tipoPago,
            EstadoVenta estadoVenta, LocalDate desde, LocalDate hasta,
            TipoVenta tipoVenta
    ) {
        List<Venta> ventas = this.ventaRepository.findVentasConFiltros(
                estadoVenta, null,
                tipoPago, desde, hasta, montoMinimo, montoMaximo, tipoVenta
        );

        return ventas.stream().map(VentaSimpleDto::toDto).toList();
    }

    @Override
    public List<ProductoVendidoDTO> generarReporteProductosVendidos(
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
    ) {
        // Convertir Enums a String para la query nativa
        List<Object[]> resultados = productoRepository.findProductosMasVendidos(
                desde,
                hasta,
                marca != null ? marca.name() : null,
                genero != null ? genero.name() : null,
                tipoPrenda != null ? tipoPrenda.name() : null,
                talla != null ? talla.name() : null,
                temporada != null ? temporada.name() : null,
                estilo != null ? estilo.name() : null,
                material != null ? material.name() : null,
                uso != null ? uso.name() : null,
                tipoVenta != null ? tipoVenta.name() : null,
                tipoPago != null ? tipoPago.name() : null,
                estadoVenta != null ? estadoVenta.name() : null,
                ordenarPor,
                orden,
                limite
        );
        return resultados.stream()
                .map(this::mapearADTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductoVentaMesDto> generarReporteProductosMensual(
            LocalDate desde, LocalDate hasta
    ) {
        // Convertir Enums a String para la query nativa
        List<Object[]> resultados = productoRepository.findVentasMensuales(
                desde,
                hasta
        );
        return resultados.stream()
                .map(this::aDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VentaEstadisticaDto> obtenerEstadisticasVentasMensuales() {
        LocalDate fechaLimite = LocalDate.now().minusMonths(12).withDayOfMonth(1);
        return this.ventaRepository.contarVentasPorMes(fechaLimite);
    }

    private ProductoVendidoDTO mapearADTO(Object[] row) {
        return ProductoVendidoDTO.builder()
                .productoId(((Number) row[0]).longValue())
                .productoNombre((String) row[1])
                .marca((String) row[2])
                .precio((BigDecimal) row[3])
                .cantidadVendida(((Number) row[4]).intValue())
                .totalVentas((BigDecimal) row[5])
                .genero((String) row[6])
                .tipoPrenda((String) row[7])
                .talla((String) row[8])
                .build();
    }

    private ProductoVentaMesDto aDTO(Object[] row) {
        return ProductoVentaMesDto.builder()
                .productoId(((Number) row[0]).longValue())
                .productoNombre((String) row[1])
                .marca((String) row[2])
                .precio((BigDecimal) row[3])
                .cantidadVendida(((Number) row[4]).intValue())
                .totalVentas((BigDecimal) row[5])
                .genero((String) row[6])
                .tipoPrenda((String) row[7])
                .talla((String) row[8])
                .anio(((Number) row[9]).intValue())
                .mes(((Number) row[10]).intValue())
                .build();
    }
}
