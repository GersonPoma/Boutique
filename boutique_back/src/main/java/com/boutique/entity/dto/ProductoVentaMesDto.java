package com.boutique.entity.dto;

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
public class ProductoVentaMesDto {
    private Long productoId;
    private String productoNombre;
    private String marca;
    private BigDecimal precio;
    private Integer cantidadVendida;
    private BigDecimal totalVentas;

    private String genero;
    private String tipoPrenda;
    private String talla;

    private Integer anio;
    private Integer mes;
}
