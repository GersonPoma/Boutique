package com.boutique.service.impl;

import com.boutique.entity.Credito;
import com.boutique.entity.Cuota;
import com.boutique.entity.Pago;
import com.boutique.entity.dto.CreditoDto;
import com.boutique.entity.dto.CuotaDto;
import com.boutique.entity.enums.Frecuencia;
import com.boutique.repository.CuotaRepository;
import com.boutique.service.CreditoService;
import com.boutique.service.CuotaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * @author GERSON
 */

@Service
@Transactional
public class CuotaServiceImpl implements CuotaService {
    @Autowired
    private CuotaRepository repository;
    @Autowired
    @Lazy
    private CreditoService creditoService;

    @Override
    @Transactional(readOnly = true)
    public List<CuotaDto> listarCuotasPorCredito(Long idCredito) {
        return this.repository.findByCreditoIdOrderByNumeroAsc(idCredito)
                .stream()
                .map(CuotaDto::toDto)
                .toList();
    }

    @Override
    @Transactional
    public void generarCuotasParaCredito(Credito credito, Frecuencia frecuencia) {
        LocalDate fechaVencimiento = credito.getFechaInicio();

        for (short i = 1; i <= credito.getNumeroCuotas(); i++) {
            Cuota cuota = crearCuota(i, credito.getMontoCuota(), fechaVencimiento, credito);
            this.repository.save(cuota);
            fechaVencimiento = siguienteFechaVencimiento(fechaVencimiento, frecuencia);
        }
    }

    @Override
    @Transactional
    public void actualizarEstadoCuotaDespuesDePago(Long idCuota, Pago pago) {
        Cuota cuota = getCuotaById(idCuota);
        cuota.setFechaPago(pago.getFecha());
        cuota.setPagada(true);
        cuota.setPago(pago);
        this.repository.save(cuota);

        this.creditoService.actualizarSaldoCreditoDespuesDePago(cuota.getCredito().getId());
    }

    private Cuota crearCuota(
            short numero, BigDecimal monto, LocalDate fechaVencimiento,
            Credito credito
    ) {
        return Cuota.builder()
                .numero(numero)
                .monto(monto)
                .fechaVencimiento(fechaVencimiento)
                .pagada(false)
                .credito(credito)
                .build();
    }

    private LocalDate siguienteFechaVencimiento(
            LocalDate fechaActual, Frecuencia frecuencia
    ) {
        return switch (frecuencia) {
//            case DIARIA -> fechaActual.plusDays(1);
            case QUINCENAL -> fechaActual.plusDays(15);
            case SEMANAL -> fechaActual.plusWeeks(1);
            case MENSUAL -> fechaActual.plusMonths(1);
//            case BIMESTRAL -> fechaActual.plusMonths(2);
//            case TRIMESTRAL -> fechaActual.plusMonths(3);
//            case SEMESTRAL -> fechaActual.plusMonths(6);
//            case ANUAL -> fechaActual.plusYears(1);
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Frecuencia no soportada: " + frecuencia
            );
        };
    }

    private Cuota getCuotaById(Long idCuota) {
        return this.repository.findById(idCuota)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cuota no encontrada con ID: " + idCuota
                ));
    }
}
