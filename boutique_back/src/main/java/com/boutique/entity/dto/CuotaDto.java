package com.boutique.entity.dto;

import com.boutique.entity.Cuota;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * @author GERSON
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CuotaDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    private Short numero;
    private BigDecimal monto;
    private LocalDate fechaVencimiento;
    private LocalDate fechaPago;
    private Boolean pagada;
    private Long idCredito;

    public static CuotaDto toDto(Cuota cuota) {
        return CuotaDto.builder()
                .id(cuota.getId())
                .numero(cuota.getNumero())
                .monto(cuota.getMonto())
                .fechaVencimiento(cuota.getFechaVencimiento())
                .fechaPago(cuota.getFechaPago())
                .pagada(cuota.getPagada())
                .idCredito(cuota.getCredito().getId())
                .build();
    }
}
