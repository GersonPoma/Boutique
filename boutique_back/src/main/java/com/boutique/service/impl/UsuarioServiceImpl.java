package com.boutique.service.impl;

import com.boutique.entity.dto.NuevoUsuario;
import com.boutique.entity.Usuario;
import com.boutique.entity.dto.UsuarioDto;
import com.boutique.repository.ClienteRepository;
import com.boutique.repository.EmpleadoRepository;
import com.boutique.repository.UsuarioRepository;
import com.boutique.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

/**
 * @author GERSON
 */

@Service
@Transactional
public class UsuarioServiceImpl implements UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<UsuarioDto> listarUsuarios(Pageable pageable) {
        return usuarioRepository.findByActivoTrue(pageable)
                .map(UsuarioDto::toDto);
    }

    @Override
    @Transactional
    public UsuarioDto crearUsuario(NuevoUsuario nuevoUsuario) {
        verificarUsuarioExistente(nuevoUsuario.getUsername());
        verificarDatos(nuevoUsuario);

        Usuario usuario = Usuario.builder()
                .username(nuevoUsuario.getUsername())
                .password(passwordEncoder.encode(nuevoUsuario.getPassword()))
                .rol(nuevoUsuario.getRol())
                .activo(true)
                .build();

        usuarioRepository.save(usuario);
        return UsuarioDto.toDto(usuario);
    }

    @Override
    @Transactional
    public void eliminarUsuario(String username) {
        Usuario usuario = verificarUsuarioInexistente(username);
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void actualizarContrasena(String username, String newPassword) {
        Usuario usuario = verificarUsuarioInexistente(username);
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void actualizarUsuario(UsuarioDto usuarioNuevo, Long id) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty())
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "El ID de usuario no existe: " + id);

        Usuario usuarioExistente = usuarioOpt.get();

        if (usuarioNuevo.getUsername() != null && !usuarioNuevo.getUsername().isBlank()) {
            if (!usuarioExistente.getUsername().equals(usuarioNuevo.getUsername())) {
                verificarUsuarioExistente(usuarioNuevo.getUsername());
                usuarioExistente.setUsername(usuarioNuevo.getUsername());
            }
        }

        if (usuarioNuevo.getRol() != null) {
            usuarioExistente.setRol(usuarioNuevo.getRol());
        }

        usuarioRepository.save(usuarioExistente);
    }

    @Override
    @Transactional
    public void eliminarUsuario(Long usuarioId) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        if (usuarioOpt.isEmpty())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID de usuario no existe: " + usuarioId);
        Usuario usuario = usuarioOpt.get();
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    private void verificarUsuarioExistente(String username) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        if (usuarioOpt.isPresent())
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El nombre de usuario ya existe: " + username);
    }

    private void verificarDatos(NuevoUsuario nuevoUsuario) {
        if (nuevoUsuario.getUsername() == null || nuevoUsuario.getUsername().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El nombre de usuario no puede estar vacío.");
        if (nuevoUsuario.getPassword() == null || nuevoUsuario.getPassword().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La contraseña no puede estar vacía.");
        if (nuevoUsuario.getRol() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El rol no puede ser nulo.");
    }

    private Usuario verificarUsuarioInexistente(String username) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        if (usuarioOpt.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El nombre de usuario no existe: " + username);

        return usuarioOpt.get();
    }

}
