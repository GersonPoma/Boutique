package com.boutique.entity;

import com.boutique.entity.enums.EstadoPago;
import com.boutique.entity.enums.MetodoPago;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * @author GERSON
 */

@Getter
@Setter
@ToString(exclude = {"venta", "cuota"})
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalTime hora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "metodo_pago", length = 20)
    private MetodoPago metodoPago;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "pago_de", length = 20)
    private String pagoDe;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPago estado;

    // Dirección bidireccional con Venta
    @OneToOne(mappedBy = "pago")
    private Venta venta;

    @OneToOne(mappedBy = "pago")
    private Cuota cuota;
}
