package com.boutique.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * DTO genérico para respuestas paginadas
 * Contiene solo la información esencial de paginación
 * @param <T> Tipo de dato del contenido
 * @author GERSON
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginacionDto<T> {
    private List<T> content;
    private int totalPages;
    private long totalElements;
    private int size;
    private int number;

    /**
     * Crea un PaginacionDto a partir de un Page de Spring Data
     * @param page El Page de Spring Data
     * @param <T> Tipo de dato
     * @return PaginacionDto con solo los campos necesarios
     */
    public static <T> PaginacionDto<T> fromPage(Page<T> page) {
        return PaginacionDto.<T>builder()
                .content(page.getContent())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .size(page.getSize())
                .number(page.getNumber())
                .build();
    }
}

