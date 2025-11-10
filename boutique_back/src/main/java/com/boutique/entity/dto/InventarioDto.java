package com.boutique.entity.dto;

import com.boutique.entity.Inventario;
import com.boutique.entity.Producto;
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
public class InventarioDto {
    private Long id;
    private Integer cantidad;
    private Long idSucursal;
    private Long idProducto;
    private String nombreSucursal;
    private String nombreProducto;

    public static InventarioDto toDto(Inventario inventario) {
        return InventarioDto.builder()
                .id(inventario.getId())
                .cantidad(inventario.getCantidad())
                .idSucursal(inventario.getSucursal().getId())
                .idProducto(inventario.getProducto().getId())
                .nombreSucursal(inventario.getSucursal().getNombre())
                .nombreProducto(inventario.getProducto().getNombre())
                .build();
    }

    public static Inventario toEntity(InventarioDto inventario) {
        Sucursal sucursal = Sucursal.builder()
                .id(inventario.getIdSucursal())
                .build();
        Producto producto = Producto.builder()
                .id(inventario.getIdProducto())
                .build();

        return Inventario.builder()
                .id(inventario.getId())
                .cantidad(inventario.getCantidad())
                .sucursal(sucursal)
                .producto(producto)
                .build();
    }
}
