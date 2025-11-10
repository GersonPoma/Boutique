package com.boutique.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

/**
 * @author GERSON
 */

@Getter
@Setter
@ToString(exclude = {"usuario", "ventas"})
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Entity
@PrimaryKeyJoinColumn(name = "id")  // comparte la PK con Persona
// en caso de usar MappedSuperclass en la clase Persona, quitar
public class Cliente extends Persona {
    @Column(nullable = false)
    private Boolean deleted = false;

    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Bidireccional
    @OneToMany(mappedBy = "cliente")
    private List<Venta> ventas;

    public Cliente(Long id) {
        super(id);
    }
}
