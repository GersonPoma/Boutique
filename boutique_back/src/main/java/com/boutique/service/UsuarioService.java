package com.boutique.service;

import com.boutique.entity.dto.NuevoUsuario;
import com.boutique.entity.dto.UsuarioDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * @author GERSON
 */

public interface UsuarioService {
    Page<UsuarioDto> listarUsuarios(Pageable pageable);
    UsuarioDto crearUsuario(NuevoUsuario nuevoUsuario);
    void actualizarContrasena(String username, String newPassword);
    void actualizarUsuario(UsuarioDto usuarioNuevo, Long id);
    void eliminarUsuario(String username);
    void eliminarUsuario(Long usuarioId);
}
