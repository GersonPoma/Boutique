package com.boutique.entity.dto;

import com.boutique.entity.Cliente;
import com.boutique.entity.Sucursal;
import com.boutique.entity.Venta;
import com.boutique.entity.enums.EstadoVenta;
import com.boutique.entity.enums.MetodoPago;
import com.boutique.entity.enums.TipoPago;
import com.boutique.entity.enums.TipoVenta;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * @author GERSON
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VentaDetalleDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    private LocalDate fecha;
    private LocalTime hora;
    private BigDecimal total;
    private TipoVenta tipoVenta;
    private TipoPago tipoPago;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private EstadoVenta estado;
    private String observaciones;
    private Long idCliente;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String clienteNombre;
    private Long idSucursal;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String sucursalNombre;
    private List<DetalleVentaDto> detalles;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private CreditoDto credito;
    private Short idPlanCredito;

    public static VentaDetalleDto toDto(Venta venta, List<DetalleVentaDto> detalles, CreditoDto credito) {
        return VentaDetalleDto.builder()
                .id(venta.getId())
                .fecha(venta.getFecha())
                .hora(venta.getHora())
                .total(venta.getTotal())
                .tipoVenta(venta.getTipoVenta())
                .tipoPago(venta.getTipoPago())
                .estado(venta.getEstado())
                .observaciones(venta.getObservaciones())
                .idCliente(venta.getCliente().getId())
                .clienteNombre(venta.getCliente().getNombreCompleto())
                .idSucursal(venta.getSucursal() != null ? venta.getSucursal().getId() : null)
                .sucursalNombre(venta.getSucursal() != null ? venta.getSucursal().getNombre() : null)
                .detalles(detalles)
                .credito(credito)
                .idPlanCredito(credito != null ? credito.getPlanCredito().getId() : null)
                .build();
    }

    public static Venta toEntity(VentaDetalleDto venta) {
        return Venta.builder()
                .id(venta.getId())
                .fecha(venta.getFecha())
                .hora(venta.getHora())
                .total(venta.getTotal())
                .tipoVenta(venta.getTipoVenta())
                .tipoPago(venta.getTipoPago())
                .observaciones(venta.getObservaciones())
                .cliente(new Cliente(venta.getIdCliente()))
                .sucursal(new Sucursal(venta.getIdSucursal()))
                .build();
    }
}
