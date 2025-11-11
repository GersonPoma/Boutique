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
public class ProductoVendidoDTO {
    private Long productoId;
    private String productoNombre;
    private String marca;
    private BigDecimal precio;
    private Integer cantidadVendida;
    private BigDecimal totalVentas;
}