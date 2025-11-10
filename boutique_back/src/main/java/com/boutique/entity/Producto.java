package com.boutique.entity;

import com.boutique.entity.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author GERSON
 */

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Marca marca;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Genero genero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, name = "tipo_prenda")
    private TipoPrenda tipoPrenda;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Talla talla;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Temporada temporada;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Estilo estilo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Material material;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Uso uso;

    // Relación bidireccional con DetalleVenta
    @OneToMany(mappedBy = "producto")
    private List<DetalleVenta> detalles;

    public Producto(Long id) {
        this.id = id;
    }
}
