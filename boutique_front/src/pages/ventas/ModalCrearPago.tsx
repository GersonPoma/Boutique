import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { MetodoPago } from "../../types/pago";
import { crearPago } from "../../api/pago";


interface Props {
  open: boolean;
  onClose: () => void;
  onGuardado?: () => void;
  idVenta: number | null;
  monto: number;
}

export const ModalCrearPago = ({
  open,
  onClose,
  onGuardado,
  idVenta,
  monto,
}: Props) => {
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(MetodoPago.EFECTIVO);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleGuardar = async () => {
    try {
      setLoading(true);

      // Tomamos fecha y hora local
      const now = new Date();
      const fecha = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
      const hora = now.toTimeString().split(" ")[0]; // "HH:mm:ss"

      // JSON que espera el backend
      const nuevoPago = {
        fecha,
        hora,
        metodoPago,
        monto,
        idVenta,
      };

      await crearPago(nuevoPago);

      setSnackbar({
        open: true,
        message: "Pago registrado correctamente.",
        severity: "success",
      });

      onGuardado?.();
      onClose();
    } catch (error: any) {
      console.error("Error al registrar pago:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || "Error al registrar el pago.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Registrar Pago</DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Mostrar monto de la venta */}
              <Typography variant="h6" textAlign="center">
                Monto a pagar: <strong>${monto.toFixed(2)}</strong>
              </Typography>

              {/* Selección del método de pago */}
              <TextField
                select
                label="Método de Pago"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                fullWidth
              >
                <MenuItem value={MetodoPago.EFECTIVO}>Efectivo</MenuItem>
                <MenuItem value={MetodoPago.TARJETA}>Tarjeta</MenuItem>
                <MenuItem value={MetodoPago.QR}>QR</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGuardar}
            disabled={loading}
          >
            Guardar Pago
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
