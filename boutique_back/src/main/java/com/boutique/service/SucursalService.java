package com.boutique.service;

import com.boutique.entity.dto.SucursalDto;

import java.util.List;

/**
 * @author GERSON
 */

public interface SucursalService {
    List<SucursalDto> listarSucursales();
    SucursalDto crearSucursal(SucursalDto nuevaSucursal);
    SucursalDto obtenerSucursalPorId(Long id);
    SucursalDto actualizarSucursal(Long id, SucursalDto nuevaSucursal);
    void eliminarSucursal(Long id);
}
