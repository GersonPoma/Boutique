import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../context/AuthContext";
import { Rol } from "../../types/usuario";
import { getSucursales } from "../../api/sucursales";
import { getPrecioProducto } from "../../api/productos";
import { crearVenta } from "../../api/ventas";
import { getPlanesCredito } from "../../api/plan_credito";
import { crearCliente, getClienteByCi } from "../../api/cliente";
import { TipoPago, TipoVenta } from "../../types/venta";
import type { Cliente } from "../../types/cliente";

export const ModalCrearVenta = ({ open, onClose, onGuardado }: any) => {
  const { user } = useAuth();
  const esAdmin = user?.rol === Rol.ADMIN;

  const [loading, setLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Campos del formulario
  const [idSucursal, setIdSucursal] = useState<number | null>(
    esAdmin ? null : user?.id_sucursal ?? null
  );
  const [tipoPago, setTipoPago] = useState<TipoPago>(TipoPago.CONTADO);
  const [observaciones, setObservaciones] = useState("Sin observaciones.");

  // Cliente
  const [ci, setCi] = useState("");
  const [cliente, setCliente] = useState<any | null>(null);
  const [errorCliente, setErrorCliente] = useState<string | null>(null);
  const [nuevoCliente, setNuevoCliente] = useState<Partial<Cliente>>({
    nombre: '',
    apellido: '',
    fechaNacimiento: ''
  });

  // Plan crédito
  const [planesCredito, setPlanesCredito] = useState<any[]>([]);
  const [idPlanCredito, setIdPlanCredito] = useState<number | null>(null);

  // Sucursales
  const [sucursales, setSucursales] = useState<any[]>([]);

  // Productos / Detalles
  const [codigoProducto, setCodigoProducto] = useState("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [detalles, setDetalles] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Cargar datos iniciales
  useEffect(() => {
    if (open) {
      if (esAdmin) fetchSucursales();
      fetchPlanesCredito();
    }
  }, [open]);

  const fetchSucursales = async () => {
    try {
      const data = await getSucursales();
      setSucursales(data);
    } catch (err) {
      console.error("Error al cargar sucursales:", err);
    }
  };

  const fetchPlanesCredito = async () => {
    try {
      const data = await getPlanesCredito();
      setPlanesCredito(data);
    } catch (err) {
      console.error("Error al cargar planes de crédito:", err);
    }
  };

  const handleBuscarCliente = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && ci.trim() !== "") {
      try {
        setErrorCliente(null);
        setCliente(null);
        const data = await getClienteByCi(ci);
        setCliente(data);
      } catch (error: any) {
        console.error(error);
        setErrorCliente(error.response?.data?.detail || "Error al buscar cliente.");
      }
    }
  };

  // Calcular total
  const calcularTotal = (listaDetalles: any[]) => {
    const nuevoTotal = listaDetalles.reduce((acc, item) => acc + item.subTotal, 0);
    setTotal(nuevoTotal);
  };

  // Agregar producto
  const handleAgregarProducto = async () => {
    if (!codigoProducto) return;

    try {
      const precio = await getPrecioProducto(Number(codigoProducto));
      const subTotal = precio * cantidad;

      const nuevo = {
        idProducto: Number(codigoProducto),
        cantidad,
        precioUnitario: precio,
        subTotal,
      };

      const nuevosDetalles = [...detalles, nuevo];
      setDetalles(nuevosDetalles);
      calcularTotal(nuevosDetalles);

      // reset inputs
      setCodigoProducto("");
      setCantidad(1);
    } catch (error) {
      console.error("Error al obtener precio del producto:", error);
      setSnackbar({
        open: true,
        message: "No se pudo obtener el precio del producto.",
        severity: "error",
      });
    }
  };

  // Eliminar detalle
  const handleEliminarDetalle = (index: number) => {
    const nuevosDetalles = detalles.filter((_, i) => i !== index);
    setDetalles(nuevosDetalles);
    calcularTotal(nuevosDetalles);
  };

  // Guardar venta
  const handleGuardar = async () => {
    if (!cliente) {
      setErrorCliente("Debe seleccionar un cliente válido.");
      return;
    }

    if (!idSucursal) {
      setSnackbar({
        open: true,
        message: "Debe seleccionar una sucursal.",
        severity: "error",
      });
      return;
    }

    if (detalles.length === 0) {
      setSnackbar({
        open: true,
        message: "Debe agregar al menos un producto.",
        severity: "error",
      });
      return;
    }

    const fecha = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const hora = new Date().toTimeString().split(" ")[0]; // "HH:mm:ss"

    const venta = {
      fecha,
      hora,
      total,
      tipoVenta: TipoVenta.FISICA,
      tipoPago,
      observaciones,
      idCliente: cliente.id,
      idSucursal,
      detalles,
      idPlanCredito: tipoPago === TipoPago.CREDITO ? idPlanCredito : null,
    };

    try {
      setLoading(true);
      await crearVenta(venta);
      setSnackbar({
        open: true,
        message: "Venta creada exitosamente.",
        severity: "success",
      });

      // Reset form
      setCi("");
      setCliente(null);
      setDetalles([]);
      setTotal(0);
      setTipoPago(TipoPago.CONTADO);
      setIdPlanCredito(null);
      setObservaciones("Sin observaciones.");
      if (esAdmin) setIdSucursal(null);

      onGuardado?.();
      onClose();
    } catch (error: any) {
      console.error("Error al crear venta:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || "Error al crear la venta.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarVenta = () => {
    // Reset form
    setCi("");
    setCliente(null);
    setDetalles([]);
    setTotal(0);
    setTipoPago(TipoPago.CONTADO);
    setIdPlanCredito(null);
    setObservaciones("Sin observaciones.");
    if (esAdmin) setIdSucursal(null);
  };

  const handleRegistrarCliente = async () => {
    if (!ci || !nuevoCliente) {
      setErrorCliente("Debe ingresar CI y datos del nuevo cliente.");
      return;
    }

    try {
      const clienteData = {
        ci,
        nombre: nuevoCliente.nombre,
        apellido: nuevoCliente.apellido,
        fechaNacimiento: nuevoCliente.fechaNacimiento,
      };
      const creado = await crearCliente(clienteData);
      setCliente(creado);
      setErrorCliente(null);
      setSnackbar({
        open: true,
        message: "Cliente registrado exitosamente.",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error al registrar cliente:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || "Error al registrar cliente.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nueva Venta</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {/* SUCURSAL (solo admin) */}
              {esAdmin && (
                <TextField
                  select
                  label="Sucursal"
                  value={idSucursal ?? ""}
                  onChange={(e) => setIdSucursal(Number(e.target.value))}
                >
                  {sucursales.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {/* CLIENTE */}
              <Box>
                <TextField
                  label="CI del Cliente"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  onKeyDown={handleBuscarCliente}
                  fullWidth
                />
                {cliente && (
                  <Typography mt={1}>
                    Cliente: <strong>{cliente.nombre} {cliente.apellido}</strong>
                  </Typography>
                )}
                {errorCliente && (
                  <Box mt={2}>
                    <Typography color="error" mt={1}>
                      {errorCliente}
                    </Typography>

                    <Typography variant="body2" mt={1}>
                        Registrar nuevo cliente:
                    </Typography>

                    <Box display="flex" gap={2} mt={1}>
                      <TextField
                        label="Nombre"
                        value={nuevoCliente.nombre}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre : e.target.value })}
                      />
                      <TextField
                        label="Apellido"
                        value={nuevoCliente.apellido}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, apellido: e.target.value })}
                      />
                      <TextField
                        label="Fecha de Nacimiento"
                        type="date"
                        value={nuevoCliente.fechaNacimiento}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, fechaNacimiento: e.target.value })}
                        slotProps={{
                            inputLabel: { shrink: true }
                        }}
                      />
                    </Box>

                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ mt: 1 }}
                      onClick={handleRegistrarCliente}
                    >
                      Registrar Cliente
                    </Button>
                  </Box>
                )}
              </Box>

              {/* TIPO DE PAGO */}
              <TextField
                select
                label="Tipo de Pago"
                value={tipoPago}
                onChange={(e) => setTipoPago(e.target.value as any)}
              >
                <MenuItem value="CONTADO">Contado</MenuItem>
                <MenuItem value="CREDITO">Crédito</MenuItem>
              </TextField>

              {/* PLAN DE CRÉDITO */}
              {tipoPago === "CREDITO" && (
                <TextField
                  select
                  label="Plan de Crédito"
                  value={idPlanCredito ?? ""}
                  onChange={(e) => setIdPlanCredito(Number(e.target.value))}
                  fullWidth
                >
                  {planesCredito.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nombre} — {p.descripcion} ({p.plazo} cuotas, {p.frecuencia}, {p.interesAnual}% interés)
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {/* OBSERVACIONES */}
              <TextField
                label="Observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />

              {/* PRODUCTOS */}
              <Typography variant="h6" mt={2}>
                Productos
              </Typography>

              <Box display="flex" gap={2}>
                <TextField
                  label="Código (ID Producto)"
                  value={codigoProducto}
                  onChange={(e) => setCodigoProducto(e.target.value)}
                />
                <TextField
                  label="Cantidad"
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  sx={{ width: 120 }}
                />
                <Button variant="contained" onClick={handleAgregarProducto}>
                  Agregar
                </Button>
              </Box>

              {/* Tabla de detalles */}
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID Producto</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Precio Unitario</TableCell>
                    <TableCell>Subtotal</TableCell>
                    <TableCell align="center">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalles.map((d, index) => (
                    <TableRow key={index}>
                      <TableCell>{d.idProducto}</TableCell>
                      <TableCell>{d.cantidad}</TableCell>
                      <TableCell>${d.precioUnitario.toFixed(2)}</TableCell>
                      <TableCell>${d.subTotal.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton color="error" onClick={() => handleEliminarDetalle(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Total */}
              <Typography variant="h5" textAlign="right" mt={2}>
                Total: ${total.toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { onClose(); handleCancelarVenta(); }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={loading}
          >
            Guardar Venta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
