package com.boutique.service.impl;

import com.boutique.entity.Sucursal;
import com.boutique.entity.dto.SucursalDto;
import com.boutique.repository.SucursalRepository;
import com.boutique.service.SucursalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author GERSON
 */

@Service
@Transactional
public class SucursalServiceImpl implements SucursalService {

    @Autowired
    private SucursalRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<SucursalDto> listarSucursales() {
        return this.repository.findAllByDeletedFalse().stream()
                .map(SucursalDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SucursalDto crearSucursal(SucursalDto nuevaSucursal) {
        return SucursalDto.toDto(
                this.repository.save(
                        SucursalDto.toEntity(nuevaSucursal)
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public SucursalDto obtenerSucursalPorId(Long id) {
        return SucursalDto.toDto(getSucursalEntityById(id));
    }

    @Override
    @Transactional
    public SucursalDto actualizarSucursal(Long id, SucursalDto nuevaSucursal) {
        Sucursal sucursalExistente = getSucursalEntityById(id);
        sucursalExistente.setNombre(nuevaSucursal.getNombre());
        sucursalExistente.setDireccion(nuevaSucursal.getDireccion());
        sucursalExistente.setTelefono(nuevaSucursal.getTelefono());
        return SucursalDto.toDto(
                this.repository.save(sucursalExistente)
        );
    }

    @Override
    @Transactional
    public void eliminarSucursal(Long id) {
        Sucursal sucursal = getSucursalEntityById(id);
        sucursal.setDeleted(true);
        this.repository.save(sucursal);
    }

    public Sucursal getSucursalEntityById(Long id) {
        return this.repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Sucursal con id " + id + " no encontrada"
                ));
    }
}
