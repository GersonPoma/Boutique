package com.boutique.entity.dto;

import com.boutique.entity.PlanCredito;
import com.boutique.entity.enums.Frecuencia;
import jakarta.validation.constraints.Digits;
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
public class PlanCreditoDto {
    private Short id;
    private String nombre;
    private String descripcion;
    private Short plazo;
    private Frecuencia frecuencia;
    @Digits(integer = 3, fraction = 2)
    private BigDecimal interesAnual;
    private Boolean activo;

    public static PlanCreditoDto toDto(PlanCredito planCredito) {
        return PlanCreditoDto.builder()
                .id(planCredito.getId())
                .nombre(planCredito.getNombre())
                .descripcion(planCredito.getDescripcion())
                .plazo(planCredito.getPlazo())
                .frecuencia(planCredito.getFrecuencia())
                .interesAnual(planCredito.getInteresAnual())
                .activo(planCredito.getActivo())
                .build();
    }

    public static PlanCredito toEntity(PlanCreditoDto planCreditoDto) {
        return PlanCredito.builder()
                .id(planCreditoDto.getId())
                .nombre(planCreditoDto.getNombre())
                .descripcion(planCreditoDto.getDescripcion())
                .plazo(planCreditoDto.getPlazo())
                .frecuencia(planCreditoDto.getFrecuencia())
                .interesAnual(planCreditoDto.getInteresAnual())
                .activo(true)
                .build();
    }
}
