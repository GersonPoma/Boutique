package com.boutique.service;

import com.boutique.entity.dto.PagoDetalleDto;
import com.boutique.entity.dto.PagoSimpleDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * @author GERSON
 */

public interface PagoService {
    Page<PagoSimpleDto> listarPagos(Pageable pageable);
    PagoDetalleDto obtenerPagoPorId(Long idPago);
    PagoSimpleDto crearPagoVenta(PagoSimpleDto nuevoPago);
    PagoSimpleDto crearPagoCuota(PagoSimpleDto nuevoPago);
}
