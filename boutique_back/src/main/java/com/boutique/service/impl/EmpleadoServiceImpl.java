package com.boutique.service.impl;

import com.boutique.entity.Empleado;
import com.boutique.entity.Sucursal;
import com.boutique.entity.Usuario;
import com.boutique.entity.dto.EmpleadoConUsuario;
import com.boutique.entity.dto.EmpleadoDto;
import com.boutique.entity.dto.NuevoUsuario;
import com.boutique.entity.dto.UsuarioDto;
import com.boutique.entity.enums.Cargo;
import com.boutique.entity.enums.Rol;
import com.boutique.repository.EmpleadoRepository;
import com.boutique.repository.UsuarioRepository;
import com.boutique.service.EmpleadoService;
import com.boutique.service.UsuarioService;
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
public class EmpleadoServiceImpl implements EmpleadoService {
    @Autowired
    private EmpleadoRepository repository;
    @Autowired
    private UsuarioService usuarioService;

    @Override
    @Transactional(readOnly = true)
    public List<EmpleadoDto> listarEmpleados() {
        return this.repository.findAllByDeletedFalse().stream()
                .map(EmpleadoDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpleadoDto> listarEmpleadosPorSucursal(Long idSucursal) {
        return this.repository.findBySucursalIdAndDeletedFalse(idSucursal).stream()
                .map(EmpleadoDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpleadoDto> listarEmpleadosPorCargo(Cargo cargo) {
        return this.repository.findByCargoAndDeletedFalse(cargo).stream()
                .map(EmpleadoDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpleadoDto> listarEmpleadosPorSucursalYCargo(Long idSucursal, Cargo cargo) {
        return this.repository
                .findBySucursalIdAndCargoAndDeletedFalse(idSucursal, cargo)
                .stream()
                .map(EmpleadoDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpleadoDto> listarEmpleadosPorNombre(String nombre) {
        return this.repository.findByNombreContainingIgnoreCaseAndDeletedFalse(nombre)
                .stream()
                .map(EmpleadoDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EmpleadoDto crearEmpleado(EmpleadoConUsuario nuevoEmpleado) {
        Empleado empleadoAGuardar = EmpleadoConUsuario.toEntity(nuevoEmpleado);
        Rol rol = buscarRolPorCargo(nuevoEmpleado.getCargo());
        UsuarioDto nuevoUsuario = crearUsuario(
                nuevoEmpleado.getUsername(),
                nuevoEmpleado.getPassword(),
                rol
        );
        empleadoAGuardar.setUsuario(
                Usuario.builder()
                        .id(nuevoUsuario.getId())
                        .build()
        );
        empleadoAGuardar.setSucursal(
                Sucursal.builder()
                        .id(nuevoEmpleado.getIdSucursal())
                        .build()
        );
        Empleado empleadoGuardado = this.repository.save(empleadoAGuardar);
        return EmpleadoDto.toDto(empleadoGuardado);
    }

    @Override
    @Transactional(readOnly = true)
    public EmpleadoDto obtenerEmpleadoPorId(Long id) {
        return EmpleadoDto.toDto(this.getEmpleado(id));
    }

    @Override
    @Transactional(readOnly = true)
    public EmpleadoDto obtenerEmpleadoPorCi(String ci) {
        return EmpleadoDto.toDto(this.getEmpleado(ci));
    }

    @Override
    @Transactional(readOnly = true)
    public EmpleadoConUsuario getPerfil(Long id) {
        return EmpleadoConUsuario.toDto(this.getEmpleado(id));
    }

    @Override
    @Transactional
    public EmpleadoDto actualizarEmpleado(Long id, EmpleadoDto nuevoEmpleado) {
        Empleado empleadoExistente = this.getEmpleado(id);

        empleadoExistente.setCi(nuevoEmpleado.getCi());
        empleadoExistente.setNombre(nuevoEmpleado.getNombre());
        empleadoExistente.setApellido(nuevoEmpleado.getApellido());
        empleadoExistente.setFechaNacimiento(nuevoEmpleado.getFechaNacimiento());
        empleadoExistente.setTelefono(nuevoEmpleado.getTelefono());
        empleadoExistente.setCorreo(nuevoEmpleado.getCorreo());
        empleadoExistente.setDireccion(nuevoEmpleado.getDireccion());

        Empleado empleadoActualizado = this.repository.save(empleadoExistente);
        return EmpleadoDto.toDto(empleadoActualizado);
    }

    @Override
    @Transactional
    public void eliminarEmpleado(Long id) {
        Empleado empleadoExistente = this.getEmpleado(id);
        empleadoExistente.setDeleted(true);
        this.repository.save(empleadoExistente);
    }

    private void verificarDatosEmpleado(EmpleadoConUsuario empleado) {
        if (empleado.getCi() == null || empleado.getCi().isBlank())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cédula no puede estar vacía."
            );
        if (empleado.getNombre() == null || empleado.getNombre().isBlank())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre no puede estar vacío."
            );
        if (empleado.getApellido() == null || empleado.getApellido().isBlank())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El apellido no puede estar vacío."
            );
        if (empleado.getFechaNacimiento() == null || empleado.getFechaNacimiento().toString().isBlank())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha de nacimiento no puede estar vacío."
            );
        if (empleado.getUsername() == null || empleado.getUsername().isBlank())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre de usuario no puede estar vacío."
            );
        if (empleado.getPassword() == null || empleado.getPassword().isBlank())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La contraseña no puede estar vacía."
            );
        if (empleado.getCargo() == null)
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El cargo no puede ser nulo."
            );
    }

    private Rol buscarRolPorCargo(Cargo cargo) {
        for (Rol rol : Rol.values()) {
            if (rol.name().equalsIgnoreCase(cargo.name()))
                return rol;
        }

        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "No se encontró un rol correspondiente para el cargo: " + cargo
        );
    }

    private UsuarioDto crearUsuario(String username, String password, Rol rol) {
        NuevoUsuario nuevoUsuario = NuevoUsuario.builder()
                .username(username)
                .password(password)
                .rol(rol)
                .build();
        return this.usuarioService.crearUsuario(nuevoUsuario);
    }

    private Empleado getEmpleado(Long id) {
        return this.repository.findByIdAndDeletedFalse(id).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El empleado con ID " + id + " no existe."
                ));
    }

    private Empleado getEmpleado(String ci) {
        return this.repository.findByCiAndDeletedFalse(ci).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El empleado con CI " + ci + " no existe."
                ));
    }
}
