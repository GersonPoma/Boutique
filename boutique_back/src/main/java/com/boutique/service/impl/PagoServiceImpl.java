package com.boutique.service.impl;

import com.boutique.entity.Pago;
import com.boutique.entity.dto.CuotaDto;
import com.boutique.entity.dto.PagoDetalleDto;
import com.boutique.entity.dto.PagoSimpleDto;
import com.boutique.entity.dto.VentaSimpleDto;
import com.boutique.entity.enums.EstadoPago;
import com.boutique.repository.PagoRepository;
import com.boutique.service.CuotaService;
import com.boutique.service.PagoService;
import com.boutique.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * @author GERSON
 */

@Service
@Transactional
public class PagoServiceImpl implements PagoService {
    @Autowired
    private PagoRepository repository;
    @Autowired
    private VentaService ventaService;
    @Autowired
    private CuotaService cuotaService;

    @Override
    @Transactional(readOnly = true)
    public Page<PagoSimpleDto> listarPagos(Pageable pageable) {
        return this.repository.findAll(pageable)
                .map(PagoSimpleDto::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public PagoDetalleDto obtenerPagoPorId(Long idPago) {
        Pago pago = getPagoById(idPago);

        if (pago.getCuota() != null) {
            CuotaDto cuotaDto = CuotaDto.toDto(pago.getCuota());
            return PagoDetalleDto.toDto(pago, cuotaDto, null);
        } else if (pago.getVenta() != null) {
            VentaSimpleDto ventaDto = VentaSimpleDto.toDto(pago.getVenta());
            return PagoDetalleDto.toDto(pago, null, ventaDto);
        } else {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "El pago no está asociado ni a una cuota ni a una venta."
            );
        }
    }

    @Override
    @Transactional
    public PagoSimpleDto crearPagoVenta(PagoSimpleDto nuevoPago) {
        Pago pago = PagoSimpleDto.toEntity(nuevoPago);
        pago.setPagoDe("VENTA");
        pago.setEstado(EstadoPago.COMPLETADO);
        Pago pagoGuardado = this.repository.save(pago);
        this.ventaService.actualizarEstadoVentaDespuesDePago(
                nuevoPago.getIdVenta(), pagoGuardado
        );
        return PagoSimpleDto.toDto(pagoGuardado);
    }

    @Override
    @Transactional
    public PagoSimpleDto crearPagoCuota(PagoSimpleDto nuevoPago) {
        Pago pago = PagoSimpleDto.toEntity(nuevoPago);
        pago.setPagoDe("CUOTA");
        pago.setEstado(EstadoPago.COMPLETADO);
        Pago pagoGuardado = this.repository.save(pago);
        this.cuotaService.actualizarEstadoCuotaDespuesDePago(
                nuevoPago.getIdCuota(), pagoGuardado
        );
        return PagoSimpleDto.toDto(pagoGuardado);
    }

    private Pago getPagoById(Long idPago) {
        return this.repository.findById(idPago)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pago no encontrado con ID: " + idPago)
                );
    }
}
