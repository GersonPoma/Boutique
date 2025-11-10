package com.boutique.repository;

import com.boutique.entity.Cuota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author GERSON
 */

public interface CuotaRepository extends JpaRepository<Cuota, Long> {
    List<Cuota> findByCreditoIdOrderByNumeroAsc(Long idCredito);
}
