package com.boutique.entity.dto;

import com.boutique.entity.Empleado;
import com.boutique.entity.enums.Cargo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * @author GERSON
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmpleadoConUsuario {
    private Long id;
    private String ci;
    private String nombre;
    private String apellido;
    private LocalDate fechaNacimiento;
    private String telefono;
    private String correo;
    private String direccion;
    private Cargo cargo;
    private String username;
    private String password;
    private Long idSucursal;
    private String sucursal;

    public static EmpleadoConUsuario toDto(Empleado empleado) {
        return EmpleadoConUsuario.builder()
                .id(empleado.getId())
                .ci(empleado.getCi())
                .nombre(empleado.getNombre())
                .apellido(empleado.getApellido())
                .fechaNacimiento(empleado.getFechaNacimiento())
                .telefono(empleado.getTelefono())
                .correo(empleado.getCorreo())
                .direccion(empleado.getDireccion())
                .cargo(empleado.getCargo())
                .username(empleado.getUsuario().getUsername())
                .password(null)
                .idSucursal(empleado.getSucursal().getId())
                .sucursal(empleado.getSucursal().getNombre())
                .build();
    }

    public static Empleado toEntity(EmpleadoConUsuario empleado) {
        return Empleado.builder()
                .ci(empleado.getCi())
                .nombre(empleado.getNombre())
                .apellido(empleado.getApellido())
                .fechaNacimiento(empleado.getFechaNacimiento())
                .telefono(empleado.getTelefono())
                .correo(empleado.getCorreo())
                .direccion(empleado.getDireccion())
                .deleted(false)
                .cargo(empleado.getCargo())
                .usuario(null)
                .sucursal(null)
                .build();
    }
}
