package com.boutique.service;

import com.boutique.entity.Pago;
import com.boutique.entity.dto.VentaDetalleDto;
import com.boutique.entity.dto.VentaSimpleDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * @author GERSON
 */

public interface VentaService {
    Page<VentaSimpleDto> listarVentasCompletadas(Long idSucursal, Pageable pageable);
    Page<VentaSimpleDto> listarVentasCanceladas(Long idSucursal, Pageable pageable);
    Page<VentaSimpleDto> listarVentasPendientes(Long idSucursal, Pageable pageable);
    Page<VentaSimpleDto> listarVentasEnProceso(Long idSucursal, Pageable pageable);
    Page<VentaSimpleDto> listarVentasPagandoCredito(Long idSucursal, Pageable pageable);
    Page<VentaSimpleDto> listarVentasPorCliente(Long idCliente, Pageable pageable);
    VentaSimpleDto crearVenta(VentaDetalleDto nuevaVenta);
    VentaDetalleDto obtenerDetalleVentaPorId(Long idVenta);
    void canelarVenta(Long id);
    void actualizarEstadoVentaDespuesDePago(Long idVenta, Pago pago);
}
