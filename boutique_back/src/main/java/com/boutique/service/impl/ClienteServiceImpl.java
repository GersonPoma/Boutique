package com.boutique.service.impl;

import com.boutique.entity.Cliente;
import com.boutique.entity.Usuario;
import com.boutique.entity.dto.ClienteConUsuario;
import com.boutique.entity.dto.ClienteDto;
import com.boutique.entity.enums.Rol;
import com.boutique.repository.ClienteRepository;
import com.boutique.repository.UsuarioRepository;
import com.boutique.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author GERSON
 */

@Service
@Transactional
public class ClienteServiceImpl implements ClienteService {
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private UsuarioServiceImpl usuarioService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<ClienteDto> listarClientes() {
        return clienteRepository.findAllByDeletedFalse().stream()
                .map(ClienteDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClienteDto crearCliente(ClienteDto nuevoCliente) {
        verificarDatos(nuevoCliente);
        return ClienteDto.toDto(clienteRepository.save(ClienteDto.toEntity(nuevoCliente)));
    }

    @Override
    @Transactional
    public ClienteConUsuario crearClienteConUsuario(ClienteConUsuario nuevoCliente) {
        verificarDatos(nuevoCliente);
        Cliente clienteAGuardar = ClienteConUsuario.toEntity(nuevoCliente);
        clienteAGuardar.setUsuario(crearUsuario(
                nuevoCliente.getUsername(),
                nuevoCliente.getPassword()
                )
        );
        return ClienteConUsuario.toDto(clienteRepository.save(clienteAGuardar));
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteDto obtenerClientePorCi(String ci) {
        return ClienteDto.toDto(getClientePorCi(ci));
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteConUsuario getPerfil(Long id) {
        return ClienteConUsuario.toDto(getClientePorId(id));
    }

    @Override
    @Transactional
    public ClienteDto actualizarCliente(Long id, ClienteDto nuevoCliente) {
        verificarDatos(nuevoCliente);
        Cliente clienteExistente = getClientePorId(id);

        clienteExistente.setCi(nuevoCliente.getCi());
        clienteExistente.setNombre(nuevoCliente.getNombre());
        clienteExistente.setApellido(nuevoCliente.getApellido());
        clienteExistente.setFechaNacimiento(nuevoCliente.getFechaNacimiento());
        clienteExistente.setTelefono(nuevoCliente.getTelefono());
        clienteExistente.setCorreo(nuevoCliente.getCorreo());
        clienteExistente.setDireccion(nuevoCliente.getDireccion());

        return ClienteDto.toDto(clienteRepository.save(clienteExistente));
    }

    @Override
    @Transactional
    public void eliminarCliente(Long id) {
        Cliente clienteExistente = getClientePorId(id);
        clienteExistente.setDeleted(true);
        clienteRepository.save(clienteExistente);
    }

    private void verificarDatos(ClienteDto cliente) {
        if (cliente.getCi() == null || cliente.getCi().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La cédula no puede estar vacía.");
        if (cliente.getNombre() == null || cliente.getNombre().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El nombre no puede estar vacío.");
        if (cliente.getApellido() == null || cliente.getApellido().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El apellido no puede estar vacío.");
    }

    private void verificarDatos(ClienteConUsuario cliente) {
        if (cliente.getCi() == null || cliente.getCi().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La cédula no puede estar vacía.");
        if (cliente.getNombre() == null || cliente.getNombre().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El nombre no puede estar vacío.");
        if (cliente.getApellido() == null || cliente.getApellido().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El apellido no puede estar vacío.");
        if (cliente.getFechaNacimiento() == null || cliente.getFechaNacimiento().toString().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de nacimiento no puede estar vacío.");
        if (cliente.getUsername() == null || cliente.getUsername().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El nombre de usuario no puede estar vacío.");
        if (cliente.getPassword() == null || cliente.getPassword().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La contraseña no puede estar vacía.");
    }

    private Usuario crearUsuario(String username, String password) {
         Usuario usuario = Usuario.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .rol(Rol.CLIENTE)
                .activo(true)
                .build();

         return usuarioRepository.save(usuario);
    }

    private Cliente getClientePorId(Long id) {
        return clienteRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado con id: " + id));
    }

    private Cliente getClientePorCi(String ci) {
        return clienteRepository.findByCiAndDeletedFalse(ci)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cliente no encontrado con cédula: " + ci)
                );
    }
}
