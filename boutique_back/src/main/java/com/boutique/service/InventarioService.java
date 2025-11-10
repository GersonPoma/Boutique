package com.boutique.service;

import com.boutique.entity.dto.InventarioDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * @author GERSON
 */

public interface InventarioService {
    Page<InventarioDto> listarInventario(Pageable pageable);
    Page<InventarioDto> listarInventarioPorSucursal(Long idSucursal, Pageable pageable);
    Page<InventarioDto> listarInventarioPorProducto(Long idProducto, Pageable pageable);
    InventarioDto obtenerInventarioPorId(Long id);
    InventarioDto obtenerInventarioPorSucursalYProducto(Long idSucursal, Long idProducto);
    InventarioDto crearInventario(InventarioDto nuevoInventario);
    InventarioDto actualizarInventario(Long id, InventarioDto inventarioDto);
    void eliminarInventario(Long id);
}
