package com.boutique.entity.dto;

import com.boutique.entity.enums.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author GERSON
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NuevoUsuario {
    private String username;
    private String password;
    private Rol rol;
}
