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
public class ClienteConUsuario {
    private Long id;
    private String ci;
    private String nombre;
    private String apellido;
    private LocalDate fechaNacimiento;
    private Integer edad;
    private String telefono;
    private String correo;
    private String direccion;
    private String username;
    private String password;

    public static ClienteConUsuario toDto(Cliente cliente) {
        return ClienteConUsuario.builder()
                .id(cliente.getId())
                .ci(cliente.getCi())
                .nombre(cliente.getNombre())
                .apellido(cliente.getApellido())
                .fechaNacimiento(cliente.getFechaNacimiento())
                .edad(cliente.getEdad())
                .telefono(cliente.getTelefono())
                .correo(cliente.getCorreo())
                .direccion(cliente.getDireccion())
                .username(cliente.getUsuario().getUsername())
                .password(null)
                .build();
    }

    public static Cliente toEntity(ClienteConUsuario cliente) {
        return Cliente.builder()
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
