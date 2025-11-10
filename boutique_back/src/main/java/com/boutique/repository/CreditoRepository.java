package com.boutique.repository;

import com.boutique.entity.Credito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * @author GERSON
 */

public interface CreditoRepository extends JpaRepository<Credito, Long> {
    Optional<Credito> findByVentaId(Long idVenta);
}
