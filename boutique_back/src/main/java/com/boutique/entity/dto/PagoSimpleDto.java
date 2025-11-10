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
public class PagoSimpleDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    private LocalDate fecha;
    private LocalTime hora;
    private MetodoPago metodoPago;
    private BigDecimal monto;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String pagoDe;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private EstadoPago estado;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long idVenta;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long idCuota;

    public static PagoSimpleDto toDto(Pago pago) {
        return PagoSimpleDto.builder()
                .id(pago.getId())
                .fecha(pago.getFecha())
                .hora(pago.getHora())
                .metodoPago(pago.getMetodoPago())
                .monto(pago.getMonto())
                .pagoDe(pago.getPagoDe())
                .estado(pago.getEstado())
                .build();
    }

    public static Pago toEntity(PagoSimpleDto pagoDto) {
        return Pago.builder()
                .id(pagoDto.getId())
                .fecha(pagoDto.getFecha())
                .hora(pagoDto.getHora())
                .metodoPago(pagoDto.getMetodoPago())
                .monto(pagoDto.getMonto())
                .build();
    }
}
