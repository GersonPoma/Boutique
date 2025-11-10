import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getVentaById } from "../../api/ventas";
import type { VerDetallesVenta } from "../../types/venta";

interface Props {
  open: boolean;
  onClose: () => void;
  ventaId: number | null;
}

export const ModalDetalleVenta = ({ open, onClose, ventaId }: Props) => {
  const [tabValue, setTabValue] = useState(0);
  const [venta, setVenta] = useState<VerDetallesVenta | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && ventaId) {
      setTabValue(0);
      cargarVenta(ventaId);
    } else {
      setVenta(null);
    }
  }, [open, ventaId]);

  const cargarVenta = async (id: number) => {
    try {
      setLoading(true);
      const data = await getVentaById(id);
      setVenta(data);
    } catch (error) {
      console.error("Error al obtener detalle de venta:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalle de Venta #{ventaId}</DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress />
          </Box>
        ) : venta ? (
          <>
            <Tabs
              value={tabValue}
              onChange={handleChangeTab}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              <Tab label="Detalle" />
              <Tab label="Crédito" />
              <Tab label="Cuotas" />
            </Tabs>

            {/* =======================
                TAB DETALLE
            ======================= */}
            {tabValue === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Cliente:</strong> {venta.clienteNombre}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Fecha:</strong> {`${venta.fecha} ${venta.hora}`}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Sucursal:</strong> {venta.sucursalNombre}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Tipo de venta:</strong> {venta.tipoVenta} —{" "}
                  <strong>Tipo de pago:</strong> {venta.tipoPago}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Estado:</strong> {venta.estado}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Observaciones:</strong> {venta.observaciones}
                </Typography>

                <Typography variant="h6" mt={2}>
                  Productos
                </Typography>

                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Precio Unitario</TableCell>
                      <TableCell>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {venta.detalles.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.nombreProducto}</TableCell>
                        <TableCell>{d.cantidad}</TableCell>
                        <TableCell>${d.precioUnitario.toFixed(2)}</TableCell>
                        <TableCell>${d.subTotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Typography variant="h6" textAlign="right" mt={2}>
                  Total: ${venta.total.toFixed(2)}
                </Typography>
              </Box>
            )}

            {/* =======================
                TAB CREDITO
            ======================= */}
            {tabValue === 1 && (
              <Box>
                {venta.credito ? (
                  <>
                    <Typography variant="h6">Información del Crédito</Typography>
                    <Typography>
                      <strong>Monto total:</strong> ${venta.credito.montoTotal.toFixed(2)}
                    </Typography>
                    <Typography>
                      <strong>Monto cuota:</strong> ${venta.credito.montoCuota.toFixed(2)}
                    </Typography>
                    <Typography>
                      <strong>Número de cuotas:</strong> {venta.credito.numeroCuotas}
                    </Typography>
                    <Typography>
                      <strong>Cuotas pagadas:</strong> {venta.credito.cuotasPagadas}
                    </Typography>
                    <Typography>
                      <strong>Saldo pendiente:</strong> $
                      {venta.credito.saldoPendiente.toFixed(2)}
                    </Typography>
                    <Typography>
                      <strong>Fecha inicio:</strong> {`${venta.credito.fechaInicio}`}
                    </Typography>

                    {venta.credito.planCredito && (
                      <Box mt={2}>
                        <Typography variant="h6">Plan de Crédito</Typography>
                        <Typography>
                          <strong>Nombre:</strong> {venta.credito.planCredito.nombre}
                        </Typography>
                        <Typography>
                          <strong>Descripción:</strong>{" "}
                          {venta.credito.planCredito.descripcion}
                        </Typography>
                        <Typography>
                          <strong>Plazo:</strong> {venta.credito.planCredito.plazo} cuotas
                        </Typography>
                        <Typography>
                          <strong>Frecuencia:</strong> {venta.credito.planCredito.frecuencia}
                        </Typography>
                        <Typography>
                          <strong>Interés anual:</strong>{" "}
                          {venta.credito.planCredito.interesAnual}%
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography color="text.secondary">
                    La venta fue al contado.
                  </Typography>
                )}
              </Box>
            )}

            {/* =======================
                TAB CUOTAS
            ======================= */}
            {tabValue === 2 && (
              <Box>
                {venta.credito && venta.credito.cuotas ? (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Cuotas del Crédito
                    </Typography>

                    <Table size="small" sx={{ mt: 1 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>N°</TableCell>
                          <TableCell>Monto</TableCell>
                          <TableCell>Vencimiento</TableCell>
                          <TableCell>Fecha de pago</TableCell>
                          <TableCell>Estado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {venta.credito.cuotas.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.numero}</TableCell>
                            <TableCell>${c.monto.toFixed(2)}</TableCell>
                            <TableCell>{`${c.fechaVencimiento}`}</TableCell>
                            <TableCell>
                              {c.fechaPago ? `${c.fechaPago}` : "—"}
                            </TableCell>
                            <TableCell>
                              {c.pagada ? "Pagada" : "Pendiente"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <Typography color="text.secondary">
                    La venta fue al contado.
                  </Typography>
                )}
              </Box>
            )}
          </>
        ) : (
          <Typography color="error">No se pudo cargar la venta.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
