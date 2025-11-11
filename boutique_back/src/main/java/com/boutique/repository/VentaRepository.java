package com.boutique.repository;

import com.boutique.entity.Venta;
import com.boutique.entity.enums.EstadoVenta;
import com.boutique.entity.enums.TipoPago;
import com.boutique.entity.enums.TipoVenta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * @author GERSON
 */

public interface VentaRepository extends JpaRepository<Venta, Long> {
    @Query("""
        SELECT v FROM Venta v
        WHERE v.estado = :estado
        AND (:idSucursal IS NULL OR v.sucursal.id = :idSucursal)
    """)
    Page<Venta> findVentas(EstadoVenta estado, Long idSucursal, Pageable pageable);
    Page<Venta> findByClienteId(Long idCliente, Pageable pageable);

    @Query("""
        SELECT v FROM Venta v
        WHERE (:estado IS NULL OR v.estado = :estado)
        AND (:idSucursal IS NULL OR v.sucursal.id = :idSucursal)
        AND (:tipoPago IS NULL OR v.tipoPago = :tipoPago)
        AND (CAST(:fechaDesde AS LocalDate) IS NULL OR v.fecha >= :fechaDesde)
        AND (CAST(:fechaHasta AS LocalDate) IS NULL OR v.fecha <= :fechaHasta)
        AND (CAST(:montoMinimo AS BigDecimal) IS NULL OR v.total >= :montoMinimo)
        AND (CAST(:montoMaximo AS BigDecimal) IS NULL OR v.total <= :montoMaximo)
        AND (:tipoVenta IS NULL OR v.tipoVenta = :tipoVenta)
    """)
    List<Venta> findVentasConFiltros(
            EstadoVenta estado,
            Long idSucursal,
            TipoPago tipoPago,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            BigDecimal montoMinimo,
            BigDecimal montoMaximo,
            TipoVenta tipoVenta
    );
}
