package com.boutique.controller;

import com.boutique.entity.dto.ClienteConUsuario;
import com.boutique.entity.dto.ClienteDto;
import com.boutique.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author GERSON
 */

@RestController
@RequestMapping("api/clientes")
public class ClienteController {
    @Autowired
    private ClienteService clienteService;

    @GetMapping
    public ResponseEntity<List<ClienteDto>> listarClientes() {
        return ResponseEntity.ok(clienteService.listarClientes());
    }

    @GetMapping("/{ci}")
    public ResponseEntity<ClienteDto> obtenerClientePorCi(@PathVariable String ci) {
        return ResponseEntity.ok(clienteService.obtenerClientePorCi(ci));
    }

    @GetMapping("/perfil/{id}")
    public ResponseEntity<ClienteConUsuario> getPerfil(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.getPerfil(id));
    }

    @PostMapping
    public ResponseEntity<ClienteDto> crearCliente(@RequestBody ClienteDto nuevoCliente) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clienteService.crearCliente(nuevoCliente));
    }

    @PostMapping("/con-usuario")
    public ResponseEntity<ClienteConUsuario> crearClienteConUsuario(
            @RequestBody ClienteConUsuario nuevoCliente
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clienteService.crearClienteConUsuario(nuevoCliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteDto> actualizarCliente(
            @PathVariable Long id,
            @RequestBody ClienteDto nuevoCliente
    ) {
        return ResponseEntity.ok(clienteService.actualizarCliente(id, nuevoCliente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable Long id) {
        clienteService.eliminarCliente(id);
        return ResponseEntity.ok().build();
    }
}
