package com.boutique.service.impl;

import com.boutique.entity.Credito;
import com.boutique.entity.PlanCredito;
import com.boutique.entity.Venta;
import com.boutique.entity.dto.CreditoDto;
import com.boutique.entity.dto.CuotaDto;
import com.boutique.entity.dto.PlanCreditoDto;
import com.boutique.entity.enums.Frecuencia;
import com.boutique.repository.CreditoRepository;
import com.boutique.service.CreditoService;
import com.boutique.service.CuotaService;
import com.boutique.service.PlanCreditoService;
import com.boutique.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * @author GERSON
 */

@Service
@Transactional
public class CreditoServiceImpl implements CreditoService {
    @Autowired
    private CreditoRepository repository;
    @Autowired
    private PlanCreditoService planCreditoService;
    @Autowired
    private CuotaService cuotaService;
    @Autowired
    @Lazy
    private VentaService ventaService;

    @Override
    @Transactional(readOnly = true)
    public CreditoDto obtenerCreditoPorVenta(Long idVenta) {
        Credito credito = getCreditoPorVenta(idVenta);
        if (credito == null)
            return null;

        List<CuotaDto> cuotas = cuotaService.listarCuotasPorCredito(credito.getId());
        return CreditoDto.toDto(credito, cuotas);
    }

    @Override
    @Transactional
    public void crearCreditoParaVenta(Venta venta, Short idPlanCredito) {
        PlanCreditoDto planCredito = planCreditoService.obtenerPlanCreditoPorId(idPlanCredito);
        BigDecimal montoTotal = calcularMontoTotal(
                venta.getTotal(), planCredito.getInteresAnual(),
                planCredito.getFrecuencia(), planCredito.getPlazo()
        );
        BigDecimal montoCuota = montoTotal.divide(
                BigDecimal.valueOf(planCredito.getPlazo()), 2, RoundingMode.HALF_UP
        );

        Credito credito = Credito.builder()
                .montoTotal(montoTotal)
                .montoCuota(montoCuota)
                .numeroCuotas(planCredito.getPlazo())
                .cuotasPagadas((short) 0)
                .fechaInicio(venta.getFecha().plusMonths(1))
                .saldoPendiente(montoTotal)
                .venta(venta)
                .planCredito(new PlanCredito(idPlanCredito))
                .build();

        Credito creditoGuardado = this.repository.save(credito);
        this.cuotaService.generarCuotasParaCredito(creditoGuardado, planCredito.getFrecuencia());
    }

    @Override
    @Transactional
    public void actualizarSaldoCreditoDespuesDePago(Long idCredito) {
        Credito credito = getCreditoById(idCredito);

        BigDecimal saldoPendienteAnterior = credito.getSaldoPendiente();
        Short cuotasPagadasAnterior = credito.getCuotasPagadas();

        BigDecimal nuevoSaldoPendiente = saldoPendienteAnterior.subtract(credito.getMontoCuota());
        Short nuevasCuotasPagadas = (short) (cuotasPagadasAnterior + 1);

        credito.setSaldoPendiente(nuevoSaldoPendiente);
        credito.setCuotasPagadas(nuevasCuotasPagadas);
        this.repository.save(credito);

        if (credito.getNumeroCuotas().compareTo(credito.getCuotasPagadas()) == 0) {
            this.ventaService.actualizarEstadoVentaDespuesDePago(
                    credito.getVenta().getId(), null
            );
        }
    }

    private Credito getCreditoPorVenta(Long idVenta) {
        return this.repository.findByVentaId(idVenta).orElse(null);
    }

    /**
     * Calcula el monto total del crédito basado en el total de la venta, interés anual,
     * frecuencia y plazo. La fórmula utilizada es: (Interés simple)
     * I=P×r×t donde:
     * I = Interés
     * P = Principal (monto del préstamo)
     * r = Tasa de interés anual (en decimal)
     * t = Tiempo
     * @param totalVenta
     * @param interesAnual
     * @param frecuencia
     * @param plazo
     * @return Monto total del crédito.
     */
    private BigDecimal calcularMontoTotal(
            BigDecimal totalVenta, BigDecimal interesAnual, Frecuencia frecuencia,
            Short plazo
    ) {

        BigDecimal tasaPorPeriodo = getTasaPorPeriodo(interesAnual, frecuencia);

//        // Calcula el tiempo en años
//        BigDecimal tiempo = BigDecimal.valueOf(plazo).divide(                   //        plazo
//                BigDecimal.valueOf(periodosPorAno), 4, RoundingMode.HALF_UP     // t = --------------
//        );                                                                      //     periodosPorAno

        // Calcula el interés usando la fórmula de interés simple
        // BigDecimal interes = totalVenta.multiply(tasaInteres).multiply(tiempo); // I = P × r × t
        // Simplificado a:
        // I = P × (r / periodosPorAno) × plazo
        // donde (r / periodosPorAno) es la tasa por periodo
        // y plazo es el número de periodos, porque ya se considera en la tasa por periodo.
        BigDecimal interes = totalVenta.multiply(tasaPorPeriodo)
                .multiply(BigDecimal.valueOf(plazo));// I = P × tasaPorPeriodo × plazo

        // Calcula el monto total sumando el interés al total de la venta
        BigDecimal montoTotal = totalVenta.add(interes);  // Monto total = Principal + Interés

        // Redondea el monto total a 2 decimales
        return montoTotal.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal getTasaPorPeriodo(BigDecimal interesAnual, Frecuencia frecuencia) {
        // Determina el número de periodos por año según la frecuencia
        short periodosPorAno = getPeriodoPorAno(frecuencia);

        // Calcula la tasa de interés por periodo
        BigDecimal tasaInteres = interesAnual.divide(                           //      tasaInteres
                BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP                // r = --------------
        );                                                                      //      periodosPorAno

        return tasaInteres.divide(
                BigDecimal.valueOf(periodosPorAno), 4, RoundingMode.HALF_UP
        );
    }

    private short getPeriodoPorAno(Frecuencia frecuencia) {
        return switch (frecuencia) {
//            case DIARIO -> 360;
            case SEMANAL -> 52;
            case QUINCENAL -> 24;
            case MENSUAL -> 12;
//            case BIMESTRAL -> 6;
//            case TRIMESTRAL -> 4;
//            case SEMESTRAL -> 2;
//            case ANUAL -> 1;
        };
    }

    private Credito getCreditoById(Long idCredito) {
        return this.repository.findById(idCredito)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Crédito no encontrado con ID: " + idCredito
                ));
    }
}
