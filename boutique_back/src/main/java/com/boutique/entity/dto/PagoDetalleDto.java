package com.boutique.entity.dto;

import com.boutique.entity.Pago;
import com.boutique.entity.enums.EstadoPago;
import com.boutique.entity.enums.MetodoPago;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class PagoDetalleDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    private LocalDate fecha;
    private LocalTime hora;
    private MetodoPago metodoPago;
    private BigDecimal monto;
    private String pagoDe;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private EstadoPago estado;
    private CuotaDto cuota;
    private VentaSimpleDto venta;

    public static PagoDetalleDto toDto(Pago pago, CuotaDto cuota, VentaSimpleDto venta) {
        return PagoDetalleDto.builder()
                .id(pago.getId())
                .fecha(pago.getFecha())
                .hora(pago.getHora())
                .metodoPago(pago.getMetodoPago())
                .monto(pago.getMonto())
                .pagoDe(pago.getPagoDe())
                .estado(pago.getEstado())
                .cuota(cuota)
                .venta(venta)
                .build();
    }
}
