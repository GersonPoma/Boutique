package com.boutique.service.impl;

import com.boutique.entity.DetalleVenta;
import com.boutique.entity.Producto;
import com.boutique.entity.Venta;
import com.boutique.entity.dto.DetalleVentaDto;
import com.boutique.entity.dto.InventarioDto;
import com.boutique.repository.DetalleVentaRepository;
import com.boutique.service.DetalleVentaService;
import com.boutique.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedList;
import java.util.List;

/**
 * @author GERSON
 */

@Service
@Transactional
public class DetalleVentaServiceImpl implements DetalleVentaService {
    @Autowired
    private DetalleVentaRepository repository;
    @Autowired
    private InventarioService inventarioService;

    @Override
    @Transactional(readOnly = true)
    public List<DetalleVentaDto> listarDetallesVentaPorVenta(Long idVenta) {
        return this.repository.findByVentaId(idVenta).stream()
                .map(DetalleVentaDto::toDto)
                .toList();
    }

    @Override
    @Transactional
    public void crearDetallesVenta(
            List<DetalleVentaDto> nuevosDetallesVenta,
            Long idSucursal, Venta venta
    ) {
        if (nuevosDetallesVenta == null || nuevosDetallesVenta.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La lista de detalles de venta no puede estar vacía"
            );
        }

        List<DetalleVenta> detallesCreados = ajustarDetalles(
                nuevosDetallesVenta, idSucursal, venta
        );
        this.repository.saveAll(detallesCreados);

//        DetalleVenta nuevoDetalle = DetalleVentaDto.toEntity(nuevoDetalleVenta);
//        InventarioDto inventario = this.getInventarioByProductoYSucursal(
//                nuevoDetalleVenta.getIdProducto(),
//                nuevoDetalleVenta.getIdVenta()
//        );
//
//        verificarStockDelInventario(inventario, nuevoDetalleVenta);
//        nuevoDetalle.setProducto(new Producto(inventario.getIdProducto()));
//        nuevoDetalle.setVenta(new Venta(nuevoDetalleVenta.getIdVenta()));
//        actualizarStockDelInventario(inventario, nuevoDetalleVenta);
//        DetalleVenta detalleCreado = this.repository.save(nuevoDetalle);
//        return DetalleVentaDto.toDto(detalleCreado);
    }

    @Override
    @Transactional
    public void devolverDetallesVenta(List<DetalleVentaDto> detallesVenta, Long idSucursal) {
        for (DetalleVentaDto detalleDto : detallesVenta) {
            InventarioDto inventario = this.getInventarioByProductoYSucursal(
                    detalleDto.getIdProducto(),
                    idSucursal
            );

            int nuevaCantidadInventario = inventario.getCantidad() + detalleDto.getCantidad();
            inventario.setCantidad(nuevaCantidadInventario);
            this.inventarioService.actualizarInventario(inventario.getId(), inventario);
        }
    }

    private List<DetalleVenta> ajustarDetalles(
            List<DetalleVentaDto> nuevosDetallesVenta,
            Long idSucursal, Venta venta
    ) {
        List<DetalleVenta> detallesAjustados = new LinkedList<>();

        for (DetalleVentaDto detalleDto : nuevosDetallesVenta) {
            InventarioDto inventario = this.getInventarioByProductoYSucursal(
                    detalleDto.getIdProducto(),
                    idSucursal
            );

            verificarStockDelInventario(inventario, detalleDto);

            DetalleVenta detalle = DetalleVentaDto.toEntity(detalleDto);
            detalle.setProducto(new Producto(inventario.getIdProducto()));
            detalle.setVenta(venta);

            actualizarStockDelInventario(inventario, detalleDto);

            detallesAjustados.add(detalle);
        }

        return detallesAjustados;
    }

    private InventarioDto getInventarioByProductoYSucursal(Long idProducto, Long idSucursal) {
        return this.inventarioService.obtenerInventarioPorSucursalYProducto(
                idSucursal,
                idProducto
        );
    }

    private void verificarStockDelInventario(
            InventarioDto inventario,
            DetalleVentaDto nuevoDetalleVenta
    ) {
        if (inventario.getCantidad() < nuevoDetalleVenta.getCantidad()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No hay suficiente inventario para el producto: "
                            + inventario.getNombreProducto() + " en la sucursal: "
                            + inventario.getNombreSucursal()
            );
        }
    }

    private void actualizarStockDelInventario(
            InventarioDto inventario,
            DetalleVentaDto nuevoDetalleVenta
    ) {
        int nuevoCantidadInventario = inventario.getCantidad() - nuevoDetalleVenta.getCantidad();
        inventario.setCantidad(nuevoCantidadInventario);
        this.inventarioService.actualizarInventario(inventario.getId(), inventario);
    }
}
