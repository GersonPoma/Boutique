package com.boutique.service;

import com.boutique.entity.Venta;
import com.boutique.entity.dto.DetalleVentaDto;

import java.util.List;

/**
 * @author GERSON
 */

public interface DetalleVentaService {
    List<DetalleVentaDto> listarDetallesVentaPorVenta(Long idVenta);
    void crearDetallesVenta(List<DetalleVentaDto> nuevosDetallesVenta,
                            Long idSucursal, Venta venta
    );
    void devolverDetallesVenta(List<DetalleVentaDto> detallesVenta, Long idSucursal);
}
