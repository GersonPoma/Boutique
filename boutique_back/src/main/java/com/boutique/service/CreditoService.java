package com.boutique.service;

import com.boutique.entity.Venta;
import com.boutique.entity.dto.CreditoDto;

import java.math.BigDecimal;

/**
 * @author GERSON
 */

public interface CreditoService {
    CreditoDto obtenerCreditoPorVenta(Long idVenta);
    void crearCreditoParaVenta(Venta venta, Short idPlanCredito);
    void actualizarSaldoCreditoDespuesDePago(Long idCredito);
}
