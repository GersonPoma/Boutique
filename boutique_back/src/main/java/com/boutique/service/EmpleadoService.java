package com.boutique.service;

import com.boutique.entity.dto.EmpleadoConUsuario;
import com.boutique.entity.dto.EmpleadoDto;
import com.boutique.entity.enums.Cargo;

import java.util.List;

/**
 * @author GERSON
 */

public interface EmpleadoService {
    List<EmpleadoDto> listarEmpleados();
    List<EmpleadoDto> listarEmpleadosPorSucursal(Long idSucursal);
    List<EmpleadoDto> listarEmpleadosPorCargo(Cargo cargo);
    List<EmpleadoDto> listarEmpleadosPorSucursalYCargo(Long idSucursal, Cargo cargo);
    List<EmpleadoDto> listarEmpleadosPorNombre(String nombre);
    EmpleadoDto crearEmpleado(EmpleadoConUsuario nuevoEmpleado);
    EmpleadoDto obtenerEmpleadoPorId(Long id);
    EmpleadoDto obtenerEmpleadoPorCi(String ci);
    EmpleadoConUsuario getPerfil(Long id);
    EmpleadoDto actualizarEmpleado(Long id, EmpleadoDto nuevoEmpleado);
    void eliminarEmpleado(Long id);
}
