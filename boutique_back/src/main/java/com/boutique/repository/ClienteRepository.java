package com.boutique.repository;

import com.boutique.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author GERSON
 */

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    List<Cliente> findAllByDeletedFalse();
    Optional<Cliente> findByCiAndDeletedFalse(String ci);
}
