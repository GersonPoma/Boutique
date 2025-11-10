package com.boutique.repository;

import com.boutique.entity.Venta;
import com.boutique.entity.enums.EstadoVenta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}
