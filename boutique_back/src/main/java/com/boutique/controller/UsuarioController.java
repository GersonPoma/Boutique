package com.boutique.controller;

import com.boutique.entity.dto.NuevoUsuario;
import com.boutique.entity.dto.PaginacionDto;
import com.boutique.entity.dto.UsuarioDto;
import com.boutique.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * @author GERSON
 */

@RestController
@RequestMapping("api/usuarios")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<PaginacionDto<UsuarioDto>> listarUsuarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction
    ) {
        Sort.Direction sortDirection = direction.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<UsuarioDto> pageResult = usuarioService.listarUsuarios(pageable);
        return ResponseEntity.ok(PaginacionDto.fromPage(pageResult));
    }

    @PostMapping
    public ResponseEntity<UsuarioDto> crearUsuario(@RequestBody NuevoUsuario nuevoUsuario) {
        return ResponseEntity.ok(usuarioService.crearUsuario(nuevoUsuario));
    }

    @PutMapping("/cambiar-password")
    public ResponseEntity<Void> actualizarContrasena(
            @RequestParam String username,
            @RequestParam String newPassword) {
        usuarioService.actualizarContrasena(username, newPassword);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizarUsuario(
            @RequestBody UsuarioDto usuarioNuevo,
            @PathVariable Long id
    ) {
        usuarioService.actualizarUsuario(usuarioNuevo, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> eliminarUsuarioPorUsername(@RequestParam String username) {
        usuarioService.eliminarUsuario(username);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuarioPorId(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test-error")
    public void testError() {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Prueba de error de negocio");
    }
}
