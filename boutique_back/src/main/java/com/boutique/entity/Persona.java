package com.boutique.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.Period;

/**
 * @author GERSON
 */

/**
 * De esta forma Persona sí crea su propia tabla en la base de datos
 * Las subclases tienen una clave primaria compartida con la tabla padre.
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public class Persona {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ci;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;
    private String telefono;
    private String correo;
    private String direccion;

    public Persona(Long id) {
        this.id = id;
    }

    public int getEdad() {
        return Period.between(this.fechaNacimiento, LocalDate.now()).getYears();
    }

    public String getNombreCompleto() {
        return this.nombre + " " + this.apellido;
    }
}

/**
 * De esta forma Persona solo funciona para copiar sus atributos a clases que lo hereden,
 * no crea su propia tabla en la base de datos
 */
//@Getter
//@Setter
//@MappedSuperclass
//public abstract class Persona {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    protected Long id;
//
//    @Column(nullable = false, unique = true)
//    protected String ci;
//
//    @Column(nullable = false)
//    protected String nombre;
//
//    @Column(nullable = false)
//    protected String apellido;
//
//    @Column(name = "fecha_nacimiento", nullable = false)
//    protected LocalDate fechaNacimiento;
//    protected String telefono;
//    protected String correo;
//    protected String direccion;
//}
