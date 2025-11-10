package com.boutique.controller;

import com.boutique.entity.dto.EmpleadoConUsuario;
import com.boutique.entity.dto.EmpleadoDto;
import com.boutique.entity.enums.Cargo;
import com.boutique.service.EmpleadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author GERSON
 */

@RestController
@RequestMapping("api/empleados")
public class EmpleadoController {
    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping
    public ResponseEntity<List<EmpleadoDto>> listarEmpleados() {
        return ResponseEntity.ok(this.empleadoService.listarEmpleados());
    }

    @GetMapping("/sucursal/{idSucursal}")
    public ResponseEntity<List<EmpleadoDto>> listarEmpleadosPorSucursal(
            @PathVariable Long idSucursal
    ) {
        return ResponseEntity.ok(this.empleadoService.listarEmpleadosPorSucursal(idSucursal));
    }

    @GetMapping("/cargo/{cargo}")
    public ResponseEntity<List<EmpleadoDto>> listarEmpleadosPorRol(
            @PathVariable Cargo cargo
    ) {
        return ResponseEntity.ok(this.empleadoService.listarEmpleadosPorCargo(cargo));
    }

    @GetMapping("/sucursal/{idSucursal}/cargo/{cargo}")
    public ResponseEntity<List<EmpleadoDto>> listarEmpleadosPorSucursalYCargo(
            @PathVariable Long idSucursal,
            @PathVariable Cargo cargo
    ) {
        return ResponseEntity.ok(this.empleadoService.listarEmpleadosPorSucursalYCargo(idSucursal, cargo));
    }

    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<List<EmpleadoDto>> listarEmpleadosPorNombre(
            @PathVariable String nombre
    ) {
        return ResponseEntity.ok(this.empleadoService.listarEmpleadosPorNombre(nombre));
    }

    @PostMapping
    public ResponseEntity<EmpleadoDto> crearEmpleado(
            @RequestBody EmpleadoConUsuario nuevoEmpleado
    ) {
        return ResponseEntity.ok(this.empleadoService.crearEmpleado(nuevoEmpleado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpleadoDto> obtenerEmpleadoPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(this.empleadoService.obtenerEmpleadoPorId(id));
    }

    @GetMapping("/ci/{ci}")
    public ResponseEntity<EmpleadoDto> obtenerEmpleadoPorCi(
            @PathVariable String ci
    ) {
        return ResponseEntity.ok(this.empleadoService.obtenerEmpleadoPorCi(ci));
    }

    @GetMapping("/perfil/{id}")
    public ResponseEntity<EmpleadoConUsuario> getPerfil(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(this.empleadoService.getPerfil(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpleadoDto> actualizarEmpleado(
            @PathVariable Long id,
            @RequestBody EmpleadoDto nuevoEmpleado
    ) {
        return ResponseEntity.ok(
                this.empleadoService.actualizarEmpleado(id, nuevoEmpleado)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEmpleado(
            @PathVariable Long id
    ) {
        this.empleadoService.eliminarEmpleado(id);
        return ResponseEntity.ok().build();
    }
}
