package com.boutique.repository;

import com.boutique.entity.Producto;
import com.boutique.entity.enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.Nullable;

import java.time.LocalDate;
import java.util.List;

/**
 * @author GERSON
 */

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    @Query("""
        SELECT p FROM Producto p
        WHERE (:marca IS NULL OR p.marca = :marca)
          AND (:genero IS NULL OR p.genero = :genero)
          AND (:tipoPrenda IS NULL OR p.tipoPrenda = :tipoPrenda)
          AND (:talla IS NULL OR p.talla = :talla)
          AND (:temporada IS NULL OR p.temporada = :temporada)
          AND (:uso IS NULL OR p.uso = :uso)
    """)
    Page<Producto> buscar(
            @Param("marca") @Nullable Marca marca,
            @Param("genero") @Nullable Genero genero,
            @Param("tipoPrenda") @Nullable TipoPrenda tipoPrenda,
            @Param("talla") @Nullable Talla talla,
            @Param("temporada") @Nullable Temporada temporada,
            @Param("uso") @Nullable Uso uso,
            @Param("pageable") Pageable pageable
    );


    /**
     * Obtiene productos más vendidos con filtros dinámicos
     * Combina datos de Venta, DetalleVenta y Producto
     *
     * NOTA: Se usan tipos String en los parámetros para evitar problemas de CAST con PostgreSQL.
     * La conversión Enum -> String se realiza en el Service.
     */
    @Query(value = """
        SELECT
            p.id AS productoId,
            p.nombre AS productoNombre,
            p.marca AS marca,
            p.precio AS precio,
            COALESCE(SUM(dv.cantidad), 0) AS cantidadVendida,
            COALESCE(SUM(dv.sub_total), 0) AS totalVentas,
            p.genero AS genero,
            p.tipo_prenda AS tipoPrenda,
            p.talla AS talla
        FROM producto p
        INNER JOIN detalle_venta dv ON p.id = dv.producto_id
        INNER JOIN venta v ON dv.venta_id = v.id
        WHERE v.fecha >= :desde
          AND v.fecha <= :hasta
          AND (:marca IS NULL OR p.marca = :marca)
          AND (:genero IS NULL OR p.genero = :genero)
          AND (:tipoPrenda IS NULL OR p.tipo_prenda = :tipoPrenda)
          AND (:talla IS NULL OR p.talla = :talla)
          AND (:temporada IS NULL OR p.temporada = :temporada)
          AND (:estilo IS NULL OR p.estilo = :estilo)
          AND (:material IS NULL OR p.material = :material)
          AND (:uso IS NULL OR p.uso = :uso)
          AND (:tipoVenta IS NULL OR v.tipo_venta = :tipoVenta)
          AND (:tipoPago IS NULL OR v.tipo_pago = :tipoPago)
          AND (:estadoVenta IS NULL OR v.estado = :estadoVenta)
        GROUP BY p.id, p.nombre, p.marca, p.precio, p.genero, p.tipo_prenda, p.talla
        ORDER BY
            CASE WHEN :ordenarPor = 'cantidadVendida' AND :orden = 'DESC' THEN SUM(dv.cantidad) END DESC,
            CASE WHEN :ordenarPor = 'cantidadVendida' AND :orden = 'ASC' THEN SUM(dv.cantidad) END ASC,
            CASE WHEN :ordenarPor = 'precio' AND :orden = 'DESC' THEN p.precio END DESC,
            CASE WHEN :ordenarPor = 'precio' AND :orden = 'ASC' THEN p.precio END ASC,
            CASE WHEN :ordenarPor = 'totalVentas' AND :orden = 'DESC' THEN SUM(dv.sub_total) END DESC,
            CASE WHEN :ordenarPor = 'totalVentas' AND :orden = 'ASC' THEN SUM(dv.sub_total) END ASC
        LIMIT :limite
    """, nativeQuery = true)
    List<Object[]> findProductosMasVendidos(
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta,
            @Param("marca") String marca,
            @Param("genero") String genero,
            @Param("tipoPrenda") String tipoPrenda,
            @Param("talla") String talla,
            @Param("temporada") String temporada,
            @Param("estilo") String estilo,
            @Param("material") String material,
            @Param("uso") String uso,
            @Param("tipoVenta") String tipoVenta,
            @Param("tipoPago") String tipoPago,
            @Param("estadoVenta") String estadoVenta,
            @Param("ordenarPor") String ordenarPor,
            @Param("orden") String orden,
            @Param("limite") Integer limite
    );

    @Query(value = """
        SELECT
            p.id AS productoId,
            p.nombre AS productoNombre,
            p.marca AS marca,
            p.precio AS precio,
            COALESCE(SUM(dv.cantidad), 0) AS cantidadVendida,
            COALESCE(SUM(dv.sub_total), 0) AS totalVentas,
            p.genero AS genero,
            p.tipo_prenda AS tipoPrenda,
            p.talla AS talla,
            EXTRACT(YEAR FROM v.fecha) AS anio,
            EXTRACT(MONTH FROM v.fecha) AS mes
        FROM producto p
        INNER JOIN detalle_venta dv ON p.id = dv.producto_id
        INNER JOIN venta v ON dv.venta_id = v.id
        WHERE v.fecha >= :desde
          AND v.fecha <= :hasta
        GROUP BY
            p.id, p.nombre, p.marca, p.precio, p.genero, p.tipo_prenda, p.talla,
            EXTRACT(YEAR FROM v.fecha), EXTRACT(MONTH FROM v.fecha)
        ORDER BY
            p.id, anio, mes
    """, nativeQuery = true)
    List<Object[]> findVentasMensuales(
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}
