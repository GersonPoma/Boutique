package com.boutique.entity;

import com.boutique.entity.enums.EstadoVenta;
import com.boutique.entity.enums.MetodoPago;
import com.boutique.entity.enums.TipoPago;
import com.boutique.entity.enums.TipoVenta;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * @author GERSON
 */

@Getter
@Setter
@ToString(exclude = {"cliente", "sucursal", "pago", "detalles", "credito"})
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalTime hora;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, name = "tipo_venta")
    private TipoVenta tipoVenta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, name = "tipo_pago")
    private TipoPago tipoPago;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoVenta estado;

    private String observaciones;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pago_id")
    private Pago pago;

    // Relación bidireccional con DetalleVenta
    @OneToMany(mappedBy = "venta")
    private List<DetalleVenta> detalles;

    // Relación bidireccional con Crédito
    @OneToOne(mappedBy = "venta", fetch = FetchType.LAZY)
    private Credito credito;

    public Venta(Long id) {
        this.id = id;
    }
}
