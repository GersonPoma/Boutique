package com.boutique.service.impl;

import com.boutique.entity.Pago;
import com.boutique.entity.Venta;
import com.boutique.entity.dto.CreditoDto;
import com.boutique.entity.dto.DetalleVentaDto;
import com.boutique.entity.dto.VentaDetalleDto;
import com.boutique.entity.dto.VentaSimpleDto;
import com.boutique.entity.enums.EstadoVenta;
import com.boutique.entity.enums.TipoPago;
import com.boutique.repository.VentaRepository;
import com.boutique.service.CreditoService;
import com.boutique.service.DetalleVentaService;
import com.boutique.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * @author GERSON
 */

@Service
@Transactional
public class VentaServiceImpl implements VentaService {
    @Autowired
    private VentaRepository repository;
    @Autowired
    private DetalleVentaService detalleVentaService;
    @Autowired
    private CreditoService creditoService;

    @Override
    @Transactional(readOnly = true)
    public Page<VentaSimpleDto> listarVentasCompletadas(
            Long idSucursal, Pageable pageable
    ) {
        return this.repository.findVentas(EstadoVenta.COMPLETADA, idSucursal, pageable)
                .map(VentaSimpleDto::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VentaSimpleDto> listarVentasCanceladas(
            Long idSucursal, Pageable pageable
    ) {
        return this.repository.findVentas(EstadoVenta.CANCELADA, idSucursal, pageable)
                .map(VentaSimpleDto::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VentaSimpleDto> listarVentasPendientes(
            Long idSucursal, Pageable pageable
    ) {
        return this.repository.findVentas(EstadoVenta.PENDIENTE, idSucursal, pageable)
                .map(VentaSimpleDto::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VentaSimpleDto> listarVentasEnProceso(
            Long idSucursal, Pageable pageable
    ) {
        return this.repository.findVentas(EstadoVenta.EN_PROCESO, idSucursal, pageable)
                .map(VentaSimpleDto::toDto);
    }

    @Override
    public Page<VentaSimpleDto> listarVentasPagandoCredito(
            Long idSucursal, Pageable pageable
    ) {
        return this.repository.findVentas(EstadoVenta.PAGANDO_CREDITO, idSucursal, pageable)
                .map(VentaSimpleDto::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VentaSimpleDto> listarVentasPorCliente(
            Long idCliente, Pageable pageable
    ) {
        return this.repository.findByClienteId(idCliente, pageable)
                .map(VentaSimpleDto::toDto);
    }

    @Override
    @Transactional
    public VentaSimpleDto crearVenta(VentaDetalleDto nuevaVenta) {
        if (nuevaVenta.getTipoPago() == TipoPago.CREDITO)
            return crearVentaACredito(nuevaVenta);

        return crearVentaAContado(nuevaVenta);
    }

    @Override
    @Transactional(readOnly = true)
    public VentaDetalleDto obtenerDetalleVentaPorId(Long idVenta) {
        Venta venta = getVentaById(idVenta);
        List<DetalleVentaDto> detalles = this.detalleVentaService
                .listarDetallesVentaPorVenta(idVenta);
        CreditoDto credito = this.creditoService.obtenerCreditoPorVenta(idVenta);

        return VentaDetalleDto.toDto(venta, detalles, credito);
    }

    @Override
    @Transactional
    public void canelarVenta(Long idVenta) {
        Venta venta = getVentaById(idVenta);
        List<DetalleVentaDto> detallesVenta = this.detalleVentaService
                .listarDetallesVentaPorVenta(idVenta);
        this.detalleVentaService.devolverDetallesVenta(detallesVenta, venta.getSucursal().getId());
        venta.setEstado(EstadoVenta.CANCELADA);
        this.repository.save(venta);
    }

    @Override
    @Transactional
    public void actualizarEstadoVentaDespuesDePago(Long idVenta, Pago pago) {
        Venta venta = getVentaById(idVenta);
        if (venta.getEstado() == EstadoVenta.PENDIENTE) {
            venta.setEstado(EstadoVenta.COMPLETADA);
            venta.setPago(pago);
            this.repository.save(venta);
        }

        if (venta.getEstado() == EstadoVenta.PAGANDO_CREDITO) {
            venta.setEstado(EstadoVenta.COMPLETADA);
            this.repository.save(venta);
        }
    }

    private VentaSimpleDto crearVentaAContado(VentaDetalleDto nuevaVenta) {
        Venta ventaEntidad = VentaDetalleDto.toEntity(nuevaVenta);
        ventaEntidad.setEstado(EstadoVenta.PENDIENTE);
        Venta ventaCreada = this.repository.save(ventaEntidad);
        this.detalleVentaService.crearDetallesVenta(
                nuevaVenta.getDetalles(),
                nuevaVenta.getIdSucursal(),
                ventaCreada
        );
        return VentaSimpleDto.toDto(ventaCreada);
    }

    private VentaSimpleDto crearVentaACredito(VentaDetalleDto nuevaVenta) {
        Venta ventaEntidad = VentaDetalleDto.toEntity(nuevaVenta);
        ventaEntidad.setEstado(EstadoVenta.PAGANDO_CREDITO);
        Venta ventaCreada = this.repository.save(ventaEntidad);
        this.detalleVentaService.crearDetallesVenta(
                nuevaVenta.getDetalles(),
                nuevaVenta.getIdSucursal(),
                ventaCreada
        );
        this.creditoService.crearCreditoParaVenta(
                ventaCreada, nuevaVenta.getIdPlanCredito()
        );
        return VentaSimpleDto.toDto(ventaCreada);
    }

    private Venta getVentaById(Long id) {
        return this.repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Venta no encontrada con ID: " + id)
                );
    }
}
