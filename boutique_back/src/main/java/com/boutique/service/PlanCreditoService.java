package com.boutique.service;

import com.boutique.entity.dto.PlanCreditoDto;

import java.util.List;

/**
 * @author GERSON
 */

public interface PlanCreditoService {
    List<PlanCreditoDto> listarPlanesCredito();
    PlanCreditoDto obtenerPlanCreditoPorId(Short id);
    PlanCreditoDto crearPlanCredito(PlanCreditoDto nuevoPlanCredito);
    PlanCreditoDto actualizarPlanCredito(Short id, PlanCreditoDto planCreditoActualizado);
    void eliminarPlanCredito(Short id);
}
