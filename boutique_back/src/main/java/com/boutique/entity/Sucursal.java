package com.boutique.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

/**
 * @author GERSON
 */

@Getter
@Setter
@ToString(exclude = {"empleados", "ventas"})
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Sucursal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private String telefono;

    @Column(nullable = false)
    private Boolean deleted = false;

    // Bidireccional
    @OneToMany(mappedBy = "sucursal")
    private List<Empleado> empleados;

    @OneToMany(mappedBy = "sucursal")
    private List<Venta> ventas;

    public Sucursal(Long id) {
        this.id = id;
    }
}
