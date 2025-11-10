package com.boutique.entity.dto;

import com.boutique.entity.Credito;
import com.boutique.entity.PlanCredito;
import com.boutique.entity.Venta;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * @author GERSON
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreditoDto {
    private Long id;
    private BigDecimal montoTotal;
    private BigDecimal montoCuota;
    private Short numeroCuotas;
    private Short cuotasPagadas;
    private LocalDate fechaInicio;
    private BigDecimal saldoPendiente;
    private Long idVenta;
    private PlanCreditoDto planCredito;
    private List<CuotaDto> cuotas;

    public static CreditoDto toDto(Credito credito, List<CuotaDto> cuotas) {
        return CreditoDto.builder()
                .id(credito.getId())
                .montoTotal(credito.getMontoTotal())
                .montoCuota(credito.getMontoCuota())
                .numeroCuotas(credito.getNumeroCuotas())
                .cuotasPagadas(credito.getCuotasPagadas())
                .fechaInicio(credito.getFechaInicio())
                .saldoPendiente(credito.getSaldoPendiente())
                .idVenta(credito.getVenta().getId())
                .planCredito(PlanCreditoDto.toDto(credito.getPlanCredito()))
                .cuotas(cuotas)
                .build();
    }
}
