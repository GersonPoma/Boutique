package com.boutique.entity.dto;

import com.boutique.entity.Producto;
import com.boutique.entity.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * @author GERSON
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductoDto {
    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String imagenUrl;
    private Marca marca;
    private Genero genero;
    private TipoPrenda tipoPrenda;
    private Talla talla;
    private Temporada temporada;
    private Estilo estilo;
    private Material material;
    private Uso uso;

    public static ProductoDto toDto(Producto producto) {
        return ProductoDto.builder()
                .id(producto.getId())
                .nombre(producto.getNombre())
                .descripcion(producto.getDescripcion())
                .imagenUrl(producto.getImagenUrl())
                .precio(producto.getPrecio())
                .marca(producto.getMarca())
                .genero(producto.getGenero())
                .tipoPrenda(producto.getTipoPrenda())
                .talla(producto.getTalla())
                .temporada(producto.getTemporada())
                .estilo(producto.getEstilo())
                .material(producto.getMaterial())
                .uso(producto.getUso())
                .build();
    }

    public static Producto toEntity(ProductoDto producto) {
        return Producto.builder()
                .id(producto.getId())
                .nombre(producto.getNombre())
                .descripcion(producto.getDescripcion())
                .precio(producto.getPrecio())
                .imagenUrl(producto.getImagenUrl())
                .marca(producto.getMarca())
                .genero(producto.getGenero())
                .tipoPrenda(producto.getTipoPrenda())
                .talla(producto.getTalla())
                .temporada(producto.getTemporada())
                .estilo(producto.getEstilo())
                .material(producto.getMaterial())
                .uso(producto.getUso())
                .build();
    }
}
