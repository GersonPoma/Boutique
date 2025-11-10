package com.boutique.repository;

import com.boutique.entity.Producto;
import com.boutique.entity.enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.Nullable;

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
    List<Producto> buscar(
            @Param("marca") @Nullable Marca marca,
            @Param("genero") @Nullable Genero genero,
            @Param("tipoPrenda") @Nullable TipoPrenda tipoPrenda,
            @Param("talla") @Nullable Talla talla,
            @Param("temporada") @Nullable Temporada temporada,
            @Param("uso") @Nullable Uso uso
    );
}
