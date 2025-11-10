import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { PagoDetalle } from "../../types/pago";
import { getPagoPorId } from "../../api/pago";

interface Props {
  open: boolean;
  onClose: () => void;
  idPago: number;
}

export const ModalDetallePago = ({ open, onClose, idPago }: Props) => {
  const [pago, setPago] = useState<PagoDetalle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && idPago) {
      fetchPago();
    }
  }, [open, idPago]);

  const fetchPago = async () => {
    try {
      setLoading(true);
      const data = await getPagoPorId(idPago);
      setPago(data);
    } catch (err) {
      console.error("Error al obtener pago:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalle del Pago</DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : pago ? (
          <Box display="flex" flexDirection="column" gap={2}>
            {/* === Datos generales del pago === */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Fecha:
              </Typography>
              <Typography>{pago.fecha}</Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Hora:
              </Typography>
              <Typography>{pago.hora}</Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Método de Pago:
              </Typography>
              <Typography>{pago.metodoPago}</Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Monto:
              </Typography>
              <Typography>${pago.monto.toFixed(2)}</Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Pago de:
              </Typography>
              <Typography>{pago.pagoDe}</Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Estado:
              </Typography>
              <Typography>{pago.estado}</Typography>
            </Box>

            <Divider />

            {/* === Si el pago pertenece a una venta === */}
            {pago.venta !== null ? (
              <Box>
                <Typography variant="h6">Detalles de la Venta</Typography>
                <Typography>
                  <strong>ID Venta:</strong> {pago.venta.id}
                </Typography>
                <Typography>
                  <strong>Fecha:</strong> {`${pago.venta.fecha} ${pago.venta.hora}`}
                </Typography>
                <Typography>
                  <strong>Total:</strong> ${pago.venta.total.toFixed(2)}
                </Typography>
                <Typography>
                  <strong>Tipo Venta:</strong> {pago.venta.tipoVenta}
                </Typography>
                <Typography>
                  <strong>Tipo Pago:</strong> {pago.venta.tipoPago}
                </Typography>
                <Typography>
                  <strong>Estado:</strong> {pago.venta.estado}
                </Typography>
                <Typography>
                  <strong>Cliente:</strong> {pago.venta.clienteNombre}
                </Typography>
              </Box>
            ) : (
              /* === Si el pago pertenece a una cuota === */
              <Box>
                <Typography variant="h6">Detalles de la Cuota</Typography>
                <Typography>
                  <strong>ID Cuota:</strong> {pago.cuota?.id}
                </Typography>
                <Typography>
                  <strong>Número de Cuota:</strong> {pago.cuota?.numero}
                </Typography>
                <Typography>
                  <strong>Monto:</strong> ${pago.cuota?.monto.toFixed(2)}
                </Typography>
                <Typography>
                  <strong>Fecha de Vencimiento:</strong>{" "}
                  {pago.cuota?.fechaVencimiento ? pago.cuota.fechaVencimiento.toString() : "No disponible"}
                </Typography>
                <Typography>
                  <strong>Fecha de Pago:</strong> {pago.cuota?.fechaPago ? pago.cuota.fechaPago.toString() : "No disponible"}
                </Typography>
                <Typography>
                  <strong>Pagada:</strong>{" "}
                  {pago.cuota?.pagada ? "Sí" : "No"}
                </Typography>
                <Typography>
                  <strong>ID Crédito:</strong> {pago.cuota?.idCredito}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Typography>No se encontró información del pago.</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};
