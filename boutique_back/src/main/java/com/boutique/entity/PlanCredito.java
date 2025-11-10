package com.boutique.entity;

import com.boutique.entity.enums.Frecuencia;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author GERSON
 */

@Getter
@Setter
@ToString(exclude = {"creditos"})
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class PlanCredito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String descripcion;

    @Column(nullable = false)
    private Short plazo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Frecuencia frecuencia;

    @Column(name = "interes_anual", nullable = false, precision = 5, scale = 2)
    private BigDecimal interesAnual;

    @Column(nullable = false)
    private Boolean activo;

    @OneToMany(mappedBy = "planCredito")
    private List<Credito> creditos;

    public PlanCredito(Short id) {
        this.id = id;
    }
}
