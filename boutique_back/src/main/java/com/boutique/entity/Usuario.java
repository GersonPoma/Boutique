package com.boutique.entity;

import com.boutique.entity.enums.Rol;
import jakarta.persistence.*;
import lombok.*;

/**
 * @author GERSON
 */

@Getter
@Setter
@ToString(exclude = {"empleado", "cliente"})
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol;

    @Column(nullable = false)
    private Boolean activo = true;

    // Relación bidireccional
    @OneToOne(mappedBy = "usuario", fetch = FetchType.LAZY)
    private Empleado empleado;

    @OneToOne(mappedBy = "usuario", fetch = FetchType.LAZY)
    private Cliente cliente;
}
