package com.boutique.entity.dto;

import com.boutique.entity.Venta;
import com.boutique.entity.enums.EstadoVenta;
import com.boutique.entity.enums.MetodoPago;
import com.boutique.entity.enums.TipoPago;
import com.boutique.entity.enums.TipoVenta;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * @author GERSON
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VentaSimpleDto {
    private Long id;
    private LocalDate fecha;
    private LocalTime hora;
    private BigDecimal total;
    private TipoVenta tipoVenta;
    private TipoPago tipoPago;
    private EstadoVenta estado;
    private String clienteNombre;

    public static VentaSimpleDto toDto(Venta venta) {
        return VentaSimpleDto.builder()
                .id(venta.getId())
                .fecha(venta.getFecha())
                .hora(venta.getHora())
                .total(venta.getTotal())
                .tipoVenta(venta.getTipoVenta())
                .tipoPago(venta.getTipoPago())
                .estado(venta.getEstado())
                .clienteNombre(venta.getCliente().getNombreCompleto())
                .build();
    }
}
