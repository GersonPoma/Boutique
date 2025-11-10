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
public class EmpleadoDto {
    private Long id;
    private String ci;
    private String nombre;
    private String apellido;
    private LocalDate fechaNacimiento;
    private String telefono;
    private String correo;
    private String direccion;
    private Cargo cargo;
    private Long idSucursal;
    private String sucursal;

    public static EmpleadoDto toDto(Empleado empleado) {
        return EmpleadoDto.builder()
                .id(empleado.getId())
                .ci(empleado.getCi())
                .nombre(empleado.getNombre())
                .apellido(empleado.getApellido())
                .fechaNacimiento(empleado.getFechaNacimiento())
                .telefono(empleado.getTelefono())
                .correo(empleado.getCorreo())
                .direccion(empleado.getDireccion())
                .cargo(empleado.getCargo())
                .idSucursal(empleado.getSucursal().getId())
                .sucursal(empleado.getSucursal().getNombre())
                .build();
    }

    public static Empleado toEntity(EmpleadoDto empleadoDto) {
        return Empleado.builder()
                .id(empleadoDto.getId())
                .ci(empleadoDto.getCi())
                .nombre(empleadoDto.getNombre())
                .apellido(empleadoDto.getApellido())
                .fechaNacimiento(empleadoDto.getFechaNacimiento())
                .telefono(empleadoDto.getTelefono())
                .correo(empleadoDto.getCorreo())
                .direccion(empleadoDto.getDireccion())
                .deleted(false)
                .cargo(empleadoDto.getCargo())
                .usuario(null)
                .sucursal(null)
                .build();
    }
}
