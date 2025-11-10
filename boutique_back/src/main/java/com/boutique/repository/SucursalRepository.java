package com.boutique.repository;

import com.boutique.entity.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author GERSON
 */

public interface SucursalRepository extends JpaRepository<Sucursal, Long> {
    List<Sucursal> findAllByDeletedFalse();
    Optional<Sucursal> findByIdAndDeletedFalse(Long id);
}
