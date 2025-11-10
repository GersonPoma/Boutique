import { useEffect, useState } from "react";
import type { Inventario } from "../../types/inventario";
import { createInventario, updateInventario } from "../../api/inventario";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import type { Sucursal } from "../../types/sucursal";
import { getSucursales } from "../../api/sucursales";
import { getNombreProducto } from "../../api/productos";

interface Props {
  open: boolean;
  onClose: () => void;
  onGuardado: () => void;
  inventario: Inventario | null;
}

export const ModalFormCrearEditar = ({
  open,
  onClose,
  onGuardado,
  inventario,
}: Props) => {
  const esEdicion = Boolean(inventario);
  const [guardando, setGuardando] = useState(false);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  const [nombreProducto, setNombreProducto] = useState<string | null>(null);
  const [cargandoProducto, setCargandoProducto] = useState(false);

  const [form, setForm] = useState<{
    cantidad: number;
    idSucursal: number;
    idProducto: number;
  }>({
    cantidad: 0,
    idSucursal: 0,
    idProducto: 0,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      await fetchSucursales();
      if (esEdicion && inventario) {
        setForm({
          cantidad: inventario.cantidad,
          idSucursal: inventario.idSucursal,
          idProducto: inventario.idProducto,
        });
        if (inventario.idProducto) {
          fetchNombreProducto(inventario.idProducto);
        }
      } else {
        setForm({ cantidad: 0, idSucursal: 0, idProducto: 0 });
        setNombreProducto(null);
      }
    };
    cargarDatos();
  }, [esEdicion, inventario]);

  const fetchSucursales = async () => {
    try {
      const data = await getSucursales();
      setSucursales(data);
    } catch (error) {
      console.error("Error al obtener sucursales:", error);
    }
  };

  const fetchNombreProducto = async (idProducto: number) => {
    if (!idProducto || idProducto <= 0) {
      setNombreProducto(null);
      return;
    }
    try {
      setCargandoProducto(true);
      const nombre = await getNombreProducto(idProducto);
      setNombreProducto(nombre);
    } catch (error: any) {
      // Si el back lanza un 404, mostramos mensaje amigable
      setNombreProducto(`❌ Producto con Código ${idProducto} no encontrado`);
    } finally {
      setCargandoProducto(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const valor = Number(value);

    setForm((prev) => ({ ...prev, [name]: valor }));

    // Si cambia el idProducto, buscamos el nombre
    if (name === "idProducto") {
      fetchNombreProducto(valor);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      if (esEdicion && inventario) {
        await updateInventario(inventario.id!, {
          id: inventario.id,
          cantidad: form.cantidad,
          idSucursal: form.idSucursal,
          idProducto: form.idProducto,
        });
      } else {
        const payload: Inventario = {
          id: null,
          cantidad: form.cantidad,
          idSucursal: form.idSucursal,
          idProducto: form.idProducto,
          nombreSucursal: null,
          nombreProducto: null,
        };
        await createInventario(payload);
      }
      onGuardado();
      onClose();
    } catch (err) {
      console.error("Error guardando inventario", err);
    } finally {
      setGuardando(false);
    }
  };

  const puedeGuardar =
    form.cantidad > 0 && form.idSucursal > 0 && form.idProducto > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {esEdicion ? "Editar inventario" : "Crear inventario"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Cantidad"
          name="cantidad"
          type="number"
          value={form.cantidad}
          onChange={handleChange}
          fullWidth
          margin="normal"
          slotProps={{
            input: {
                onClick: (e) => (e.target as HTMLInputElement).select(),
            }
          }}
        />

        {/* Selector de sucursal */}
        <TextField
          select
          label="Sucursal"
          name="idSucursal"
          value={form.idSucursal}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value={0} disabled>
            Seleccionar sucursal
          </MenuItem>
          {sucursales.map((sucursal) => (
            <MenuItem key={sucursal.id!} value={sucursal.id!}>
              {sucursal.nombre}
            </MenuItem>
          ))}
        </TextField>

        {/* Campo de producto */}
        <TextField
          label="Código del Producto"
          name="idProducto"
          type="number"
          value={form.idProducto}
          onChange={handleChange}
          fullWidth
          margin="normal"
          slotProps={{
            input: {
                onClick: (e) => (e.target as HTMLInputElement).select(),
            }
          }}
        />

        {/* Mostrar nombre o mensaje */}
        {cargandoProducto ? (
          <Box display="flex" alignItems="center" gap={1} mt={1} mb={1}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Buscando producto...
            </Typography>
          </Box>
        ) : nombreProducto ? (
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              mb: 1,
              color: nombreProducto.startsWith("❌")
                ? "error.main"
                : "success.main",
              fontWeight: 500,
            }}
          >
            {nombreProducto}
          </Typography>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 1 }}
          >
            Ingrese el código del producto para ver su nombre
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleGuardar}
          disabled={!puedeGuardar || guardando}
        >
          {esEdicion ? "Guardar cambios" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
