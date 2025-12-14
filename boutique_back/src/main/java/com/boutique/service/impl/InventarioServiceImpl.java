package com.boutique.service.impl;

import com.boutique.entity.Inventario;
import com.boutique.entity.dto.InventarioDto;
import com.boutique.repository.InventarioRepository;
import com.boutique.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * @author GERSON
 */

@Service
@Transactional
public class InventarioServiceImpl implements InventarioService {
    @Autowired
    private InventarioRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<InventarioDto> listarInventario(Pageable pageable) {
        return this.repository.findAll(pageable)
                .map(InventarioDto::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventarioDto> listarInventarioPorSucursal(Long idSucursal, Pageable pageable) {
        return this.repository.findBySucursalId(idSucursal, pageable)
                .map(InventarioDto::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventarioDto> listarInventarioPorProducto(Long idProducto, Pageable pageable) {
        return this.repository.findByProductoId(idProducto, pageable)
                .map(InventarioDto::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public InventarioDto obtenerInventarioPorId(Long id) {
        return InventarioDto.toDto(this.getInventarioById(id));
    }

    @Override
    public InventarioDto obtenerInventarioPorSucursalYProducto(
            Long idSucursal,
            Long idProducto
    ) {
        return InventarioDto.toDto(
                this.getInventarioBySucursalYProducto(idSucursal, idProducto)
        );
    }

    @Override
    @Transactional
    public InventarioDto crearInventario(InventarioDto nuevoInventario) {
        Inventario inventario = InventarioDto.toEntity(nuevoInventario);
        Inventario inventarioGuardado = this.repository.save(inventario);
        return InventarioDto.toDto(inventarioGuardado);
    }

    @Override
    @Transactional
    public InventarioDto actualizarInventario(Long id, InventarioDto inventarioDto) {
        Inventario inventarioExistente = this.getInventarioById(id);
        inventarioExistente.setCantidad(inventarioDto.getCantidad());
        Inventario inventarioActualizado = this.repository.save(inventarioExistente);
        return InventarioDto.toDto(inventarioActualizado);
    }

    @Override
    public Integer getStockPorSucursalYProducto(Long idSucursal, Long idProducto) {
        Inventario inventario = this.getInventarioBySucursalYProducto(idSucursal, idProducto);
        return inventario.getCantidad();
    }

    @Override
    @Transactional
    public void eliminarInventario(Long id) {
        Inventario inventarioExistente = this.getInventarioById(id);
        this.repository.delete(inventarioExistente);
    }

    private Inventario getInventarioById(Long id) {
        return this.repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Inventario con id " + id + " no encontrado"
                ));
    }

    private Inventario getInventarioBySucursalYProducto(Long idSucursal, Long idProducto) {
        return this.repository.findBySucursalIdAndProductoId(idSucursal, idProducto)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Inventario no encontrado para la sucursal con id: " + idSucursal +
                                " y el producto con id: " + idProducto
                ));
    }
}
