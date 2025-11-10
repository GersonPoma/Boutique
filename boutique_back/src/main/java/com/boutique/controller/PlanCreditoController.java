package com.boutique.controller;

import com.boutique.entity.dto.PlanCreditoDto;
import com.boutique.service.PlanCreditoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author GERSON
 */

@RestController
@RequestMapping("/api/planes-credito")
public class PlanCreditoController {
    @Autowired
    private PlanCreditoService service;

    @GetMapping
    public ResponseEntity<List<PlanCreditoDto>> listarPlanesCredito() {
        List<PlanCreditoDto> planesCredito = service.listarPlanesCredito();
        return ResponseEntity.ok(planesCredito);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanCreditoDto> obtenerPlanCreditoPorId(Short id) {
        PlanCreditoDto planCredito = service.obtenerPlanCreditoPorId(id);
        return ResponseEntity.ok(planCredito);
    }

    @PostMapping
    public ResponseEntity<PlanCreditoDto> crearPlanCredito(
            @RequestBody PlanCreditoDto nuevoPlanCredito
    ) {
        PlanCreditoDto planCreditoCreado = service.crearPlanCredito(nuevoPlanCredito);
        return ResponseEntity.status(HttpStatus.CREATED).body(planCreditoCreado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanCreditoDto> actualizarPlanCredito(
            @PathVariable Short id,
            @RequestBody PlanCreditoDto planCreditoDto
    ) {
        PlanCreditoDto planCreditoActualizado = service.actualizarPlanCredito(
                id, planCreditoDto
        );
        return ResponseEntity.ok(planCreditoActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPlanCredito(@PathVariable Short id) {
        service.eliminarPlanCredito(id);
        return ResponseEntity.noContent().build();
    }
}
