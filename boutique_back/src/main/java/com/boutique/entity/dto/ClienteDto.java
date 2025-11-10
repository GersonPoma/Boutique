package com.boutique.entity.dto;

import com.boutique.entity.Cliente;
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
public class ClienteDto {
    private Long id;
    private String ci;
    private String nombre;
    private String apellido;
    private LocalDate fechaNacimiento;
    private String telefono;
    private String correo;
    private String direccion;

    public static ClienteDto toDto(Cliente cliente) {
        return ClienteDto.builder()
                .id(cliente.getId())
                .ci(cliente.getCi())
                .nombre(cliente.getNombre())
                .apellido(cliente.getApellido())
                .fechaNacimiento(cliente.getFechaNacimiento())
                .telefono(cliente.getTelefono())
                .correo(cliente.getCorreo())
                .direccion(cliente.getDireccion())
                .build();
    }

    public static Cliente toEntity(ClienteDto cliente) {
        return Cliente.builder()
                .id(cliente.getId())
                .ci(cliente.getCi())
                .nombre(cliente.getNombre())
                .apellido(cliente.getApellido())
                .fechaNacimiento(cliente.getFechaNacimiento())
                .telefono(cliente.getTelefono())
                .correo(cliente.getCorreo())
                .direccion(cliente.getDireccion())
                .deleted(false)
                .usuario(null)
                .build();
    }
}
