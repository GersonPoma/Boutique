package com.boutique.repository;

import com.boutique.entity.Inventario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * @author GERSON
 */

public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    Page<Inventario> findBySucursalId(Long idSucursal, Pageable pageable);
    Page<Inventario> findByProductoId(Long idProducto, Pageable pageable);
    Optional<Inventario> findBySucursalIdAndProductoId(Long idSucursal, Long idProducto);
}
