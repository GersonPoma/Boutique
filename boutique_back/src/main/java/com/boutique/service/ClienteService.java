package com.boutique.service;

import com.boutique.entity.dto.ClienteConUsuario;
import com.boutique.entity.dto.ClienteDto;

import java.util.List;

/**
 * @author GERSON
 */

public interface ClienteService {
    List<ClienteDto> listarClientes();
    ClienteDto crearCliente(ClienteDto nuevoCliente);
    ClienteConUsuario crearClienteConUsuario(ClienteConUsuario nuevoCliente);
    ClienteDto obtenerClientePorCi(String ci);
    ClienteConUsuario getPerfil(Long id);
    ClienteDto actualizarCliente(Long id, ClienteDto nuevoCliente);
    void eliminarCliente(Long id);
}
