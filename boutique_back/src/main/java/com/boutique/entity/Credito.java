package com.boutique.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * @author GERSON
 */

@Getter
@Setter
@ToString(exclude = {"venta", "planCredito", "cuotas"})
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Credito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @Column(name = "monto_cuota", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoCuota;

    @Column(name = "numero_cuotas", nullable = false)
    private Short numeroCuotas;

    @Column(name = "cuotas_pagadas", nullable = false)
    private Short cuotasPagadas;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "saldo_pendiente", nullable = false, precision = 10, scale = 2)
    private BigDecimal saldoPendiente;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_credito_id", nullable = false)
    private PlanCredito planCredito;

    // Relación bidireccional con Cuota
    @OneToMany(mappedBy = "credito")
    private List<Cuota> cuotas;

    public Credito(Long id) {
        this.id = id;
    }
}
