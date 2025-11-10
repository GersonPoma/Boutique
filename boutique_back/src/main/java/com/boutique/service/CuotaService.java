package com.boutique.service;

import com.boutique.entity.Credito;
import com.boutique.entity.Pago;
import com.boutique.entity.dto.CuotaDto;
import com.boutique.entity.enums.Frecuencia;

import java.util.List;

/**
 * @author GERSON
 */

public interface CuotaService {
    List<CuotaDto> listarCuotasPorCredito(Long idCredito);
    void generarCuotasParaCredito(Credito credito, Frecuencia frecuencia);
    void actualizarEstadoCuotaDespuesDePago(Long idCuota, Pago pago);
}
