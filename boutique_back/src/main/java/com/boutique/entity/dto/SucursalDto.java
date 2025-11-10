package com.boutique.entity.dto;

import com.boutique.entity.Sucursal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author GERSON
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SucursalDto {
    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;

    public static SucursalDto toDto(Sucursal sucursal) {
        return SucursalDto.builder()
                .id(sucursal.getId())
                .nombre(sucursal.getNombre())
                .direccion(sucursal.getDireccion())
                .telefono(sucursal.getTelefono())
                .build();
    }

    public static Sucursal toEntity(SucursalDto sucursalDto) {
        return Sucursal.builder()
                .id(sucursalDto.getId())
                .nombre(sucursalDto.getNombre())
                .direccion(sucursalDto.getDireccion())
                .telefono(sucursalDto.getTelefono())
                .deleted(false)
                .build();
    }
}
