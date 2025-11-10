package com.boutique.entity.dto;

import com.boutique.entity.DetalleVenta;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.PositiveOrZero;
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
public class DetalleVentaDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subTotal;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long idVenta;
    private Long idProducto;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String nombreProducto;

    public static DetalleVentaDto toDto(DetalleVenta detalleVenta) {
        return DetalleVentaDto.builder()
                .id(detalleVenta.getId())
                .cantidad(detalleVenta.getCantidad())
                .precioUnitario(detalleVenta.getPrecioUnitario())
                .subTotal(detalleVenta.getSubTotal())
                .idVenta(detalleVenta.getVenta().getId())
                .idProducto(detalleVenta.getProducto().getId())
                .nombreProducto(detalleVenta.getProducto().getNombre())
                .build();
    }

    public static DetalleVenta toEntity(DetalleVentaDto detalleVenta) {
        return DetalleVenta.builder()
                .id(detalleVenta.getId())
                .cantidad(detalleVenta.getCantidad())
                .precioUnitario(detalleVenta.getPrecioUnitario())
                .subTotal(detalleVenta.getSubTotal())
                .build();
    }
}
