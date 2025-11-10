package com.boutique.service.impl;

import com.boutique.entity.PlanCredito;
import com.boutique.entity.dto.PlanCreditoDto;
import com.boutique.repository.PlanCreditoRepository;
import com.boutique.service.PlanCreditoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * @author GERSON
 */

@Service
@Transactional
public class PlanCreditoServiceImpl implements PlanCreditoService {
    @Autowired
    private PlanCreditoRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<PlanCreditoDto> listarPlanesCredito() {
        return this.repository.findAll().stream()
                .map(PlanCreditoDto::toDto)
                .toList();
    }

    @Override
    public PlanCreditoDto obtenerPlanCreditoPorId(Short id) {
        return PlanCreditoDto.toDto(this.getPlanCreditoById(id));
    }

    @Override
    public PlanCreditoDto crearPlanCredito(PlanCreditoDto nuevoPlanCredito) {
        return PlanCreditoDto.toDto(
                this.repository.save(
                        PlanCreditoDto.toEntity(nuevoPlanCredito)
                )
        );
    }

    @Override
    public PlanCreditoDto actualizarPlanCredito(
            Short id,
            PlanCreditoDto planCreditoActualizado
    ) {
        PlanCredito planCreditoExistente = this.getPlanCreditoById(id);
        planCreditoExistente.setNombre(planCreditoActualizado.getNombre());
        planCreditoExistente.setDescripcion(planCreditoActualizado.getDescripcion());
        planCreditoExistente.setPlazo(planCreditoActualizado.getPlazo());
        planCreditoExistente.setFrecuencia(planCreditoActualizado.getFrecuencia());
        planCreditoExistente.setInteresAnual(planCreditoActualizado.getInteresAnual());
        planCreditoExistente.setActivo(planCreditoActualizado.getActivo());
        return PlanCreditoDto.toDto(
                this.repository.save(planCreditoExistente)
        );
    }

    @Override
    public void eliminarPlanCredito(Short id) {
        PlanCredito planCreditoExistente = this.getPlanCreditoById(id);
        this.repository.delete(planCreditoExistente);
    }

    private PlanCredito getPlanCreditoById(Short id) {
        return this.repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Plan de crédito no encontrado con ID: " + id
                ));
    }
}
