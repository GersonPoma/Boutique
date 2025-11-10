package com.boutique.repository;

import com.boutique.entity.Empleado;
import com.boutique.entity.enums.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author GERSON
 */

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    List<Empleado> findAllByDeletedFalse();
    List<Empleado> findBySucursalIdAndDeletedFalse(Long idSucursal);
    List<Empleado> findByCargoAndDeletedFalse(Cargo cargo);
    List<Empleado> findBySucursalIdAndCargoAndDeletedFalse(Long idSucursal, Cargo cargo);
    List<Empleado> findByNombreContainingIgnoreCaseAndDeletedFalse(String nombre);
    Optional<Empleado> findByCiAndDeletedFalse(String ci);
    Optional<Empleado> findByIdAndDeletedFalse(Long id);
}
