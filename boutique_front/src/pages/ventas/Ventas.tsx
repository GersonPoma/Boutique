import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import type { PageResponse } from "../../types/pagination";
import { EstadoVenta, type Venta } from "../../types/venta";
import type { Sucursal } from "../../types/sucursal";
import { Rol } from "../../types/usuario";
import { getSucursales } from "../../api/sucursales";
import {
  getVentasCompletadas,
  getVentasPendientes,
  getVentasEnProceso,
  getVentasPagandoCredito,
  getVentasCanceladas,
} from "../../api/ventas";

import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import BlockIcon from "@mui/icons-material/Block";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ModalDetalleVenta } from "./ModalDetalleVenta";
import { AttachMoney } from "@mui/icons-material";
import { ModalCancelar } from "./ModalCancelar";
import { ModalCrearVenta } from "./ModalCrearVenta";
import { ModalCrearPago } from "./ModalCrearPago";

export const Ventas = () => {
  const { user } = useAuth();

  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoVenta>(EstadoVenta.COMPLETADA);

  const [datosPagina, setDatosPagina] = useState<PageResponse<Venta> | null>(null);
  const [pagina, setPagina] = useState(0);

  const [abrirModalCrear, setAbrirModalCrear] = useState(false);
  const [abrirModalCancelar, setAbrirModalCancelar] = useState(false);
  const [ventaIdSeleccionada, setVentaIdSeleccionada] = useState<number | null>(null);
  const [abrirModalDetalle, setAbrirModalDetalle] = useState(false);

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number | "">("");

  const [abrirModalCrearPago, setAbrirModalCrearPago] = useState(false);
  const [montoSeleccionado, setMontoSeleccionado] = useState(0);

  const esAdmin = user?.rol === Rol.ADMIN;

  /** ===========================
   *  FETCH SUCURSALES (solo admin)
   * =========================== */
  useEffect(() => {
    if (esAdmin) {
      fetchSucursales();
    }
  }, [esAdmin]);

  const fetchSucursales = async () => {
    try {
      const data = await getSucursales();
      setSucursales(data);
    } catch (error) {
      console.error("Error al obtener sucursales:", error);
    }
  };

  /** ===========================
   *  FETCH VENTAS SEGÚN ESTADO / SUCURSAL
   * =========================== */
  useEffect(() => {
    if (esAdmin) {
      if (sucursalSeleccionada) cargarPaginaSucursal(Number(sucursalSeleccionada), 0);
      else cargarPagina(0);
    } else if (user?.id_sucursal) {
      cargarPaginaSucursal(user.id_sucursal, 0);
    }
  }, [estadoSeleccionado]);

  /** ===========================
   *  FUNCIONES PARA CARGAR DATOS
   * =========================== */
  const obtenerApiPorEstado = (estado: EstadoVenta) => {
    switch (estado) {
      case EstadoVenta.PENDIENTE:
        return getVentasPendientes;
      case EstadoVenta.COMPLETADA:
        return getVentasCompletadas;
      case EstadoVenta.CANCELADA:
        return getVentasCanceladas;
      case EstadoVenta.EN_PROCESO:
        return getVentasEnProceso;
      case EstadoVenta.PAGANDO_CREDITO:
        return getVentasPagandoCredito;
      default:
        return getVentasCompletadas;
    }
  };

  const cargarPagina = async (numPagina: number) => {
    try {
      const api = obtenerApiPorEstado(estadoSeleccionado);
      const data = await api(numPagina, null);
      setDatosPagina(data);
      setPagina(data.number);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
    }
  };

  const cargarPaginaSucursal = async (idSucursal: number, numPagina: number) => {
    try {
      const api = obtenerApiPorEstado(estadoSeleccionado);
      const data = await api(numPagina, idSucursal);
      setDatosPagina(data);
      setPagina(data.number);
    } catch (error) {
      console.error("Error al obtener ventas por sucursal:", error);
    }
  };

  /** ===========================
   *  HANDLERS
   * =========================== */
  const handleSucursalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (value === "") {
      setSucursalSeleccionada("");
      cargarPagina(0);
      return;
    }

    const id = Number(value);
    setSucursalSeleccionada(id);
    cargarPaginaSucursal(id, 0);
  };

  const handleAbrirCrear = () => {
    setVentaIdSeleccionada(null);
    setAbrirModalCrear(true);
  }

  const handleAbrirDetalle = (venta: Venta) => {
    setVentaIdSeleccionada(venta.id);
    setAbrirModalDetalle(true);
  }

  const handleAbrirCancelar = (venta: Venta) => {
    setVentaIdSeleccionada(venta.id);
    setAbrirModalCancelar(true);
  }

  const handleGuardado = () => {
    setAbrirModalCrear(false);
    (esAdmin) && sucursalSeleccionada
      ? cargarPaginaSucursal(Number(sucursalSeleccionada), pagina)
      : user?.id_sucursal
        ? cargarPaginaSucursal(user.id_sucursal, pagina)
        : cargarPagina(pagina);
  };

//   const handleEliminado = () => {
//     setAbrirCancelar(false);
//     cargarPagina(0);
//   };

  const handleEliminado = () => {
    setAbrirModalCancelar(false);
    if (esAdmin && sucursalSeleccionada) {
      cargarPaginaSucursal(Number(sucursalSeleccionada), pagina);
    } else if (user?.id_sucursal) {
      cargarPaginaSucursal(user.id_sucursal, pagina);
    } else {
      cargarPagina(pagina);
    }
  };

  const handleCrearPago = (idVenta: number, monto: number) => {
    setVentaIdSeleccionada(idVenta);
    setMontoSeleccionado(monto);
    setAbrirModalCrearPago(true);
  }

  const handleTabChange = (_: React.SyntheticEvent, nuevoEstado: EstadoVenta) => {
    setEstadoSeleccionado(nuevoEstado);
    setPagina(0); // Reinicia la paginación
  };

  const handlePaginaAnterior = () => {
    if (pagina > 0) {
      if (esAdmin && sucursalSeleccionada)
        cargarPaginaSucursal(Number(sucursalSeleccionada), pagina - 1);
      else if (user?.id_sucursal)
        cargarPaginaSucursal(user.id_sucursal, pagina - 1);
      else cargarPagina(pagina - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    if (datosPagina && pagina < datosPagina.totalPages - 1) {
      if (esAdmin && sucursalSeleccionada)
        cargarPaginaSucursal(Number(sucursalSeleccionada), pagina + 1);
      else if (user?.id_sucursal)
        cargarPaginaSucursal(user.id_sucursal, pagina + 1);
      else cargarPagina(pagina + 1);
    }
  };

  const ventas = datosPagina?.content ?? [];

  /** ===========================
   *  RENDER
   * =========================== */
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Ventas</Typography>
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAbrirCrear}
        >
            Crear Venta
        </Button>
      </Box>

      {/* Filtro de sucursal (fuera de los tabs) */}
      {esAdmin && (
        <Box mb={2}>
          <TextField
            select
            label="Filtrar por sucursal"
            value={sucursalSeleccionada}
            onChange={handleSucursalChange}
            size="small"
            sx={{ width: { xs: "100%", sm: 280 } }}
          >
            <MenuItem value="">Seleccionar sucursal</MenuItem>
            {sucursales.map((s) => (
              <MenuItem key={s.id!} value={s.id!}>
                {s.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {/* Tabs para los estados */}
      <Tabs
        value={estadoSeleccionado}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="Completadas" value={EstadoVenta.COMPLETADA} />
        <Tab label="Pendientes" value={EstadoVenta.PENDIENTE} />
        <Tab label="En Proceso" value={EstadoVenta.EN_PROCESO} />
        <Tab label="Pagando Crédito" value={EstadoVenta.PAGANDO_CREDITO} />
        <Tab label="Canceladas" value={EstadoVenta.CANCELADA} />
      </Tabs>

      {/* Tabla de ventas */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Nro</TableCell>
            <TableCell align="center">Fecha y Hora</TableCell>
            <TableCell align="center">Tipo de Venta</TableCell>
            <TableCell align="center">Tipo de Pago</TableCell>
            <TableCell align="center">Total</TableCell>
            <TableCell align="center">Estado</TableCell>
            <TableCell align="center">Cliente</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ventas.map((v) => (
            <TableRow key={v.id}>
              <TableCell align="center">{v.id}</TableCell>
              <TableCell align="center">{`${v.fecha} ${v.hora}`}</TableCell>
              <TableCell align="center">{v.tipoVenta}</TableCell>
              <TableCell align="center">{v.tipoPago}</TableCell>
              <TableCell align="center">{v.total}</TableCell>
              <TableCell align="center">{v.estado}</TableCell>
              <TableCell align="center">{v.clienteNombre}</TableCell>
              <TableCell align="center">
                <IconButton
                    color="primary"
                    onClick={() => handleAbrirDetalle(v)}
                >
                  <RemoveRedEyeIcon />
                </IconButton>
                {estadoSeleccionado !== EstadoVenta.CANCELADA && (
                    <IconButton
                      color="error"
                      onClick={() => handleAbrirCancelar(v)}
                    >
                      <BlockIcon />
                    </IconButton>
                )}
                {estadoSeleccionado === EstadoVenta.PENDIENTE && (
                    <IconButton
                        color="primary"
                        onClick={() => { handleCrearPago(v.id, v.total) }}
                    >
                      <AttachMoney />
                    </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={8} align="center">
              <Box display="flex" justifyContent="center" alignItems="center" gap={2} my={1}>
                <IconButton onClick={handlePaginaAnterior} disabled={pagina === 0}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography>
                  Página {pagina + 1} de {datosPagina?.totalPages ?? 1}
                </Typography>
                <IconButton
                  onClick={handlePaginaSiguiente}
                  disabled={datosPagina ? pagina >= datosPagina.totalPages - 1 : true}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <ModalDetalleVenta
        open={abrirModalDetalle}
        onClose={() => setAbrirModalDetalle(false)}
        ventaId={ventaIdSeleccionada}
      /> 
      
      <ModalCancelar
        open={abrirModalCancelar}
        onClose={() => setAbrirModalCancelar(false)}
        onConfirmado={handleEliminado}
        idVenta={ventaIdSeleccionada}
      />    
      
      <ModalCrearVenta
      open={abrirModalCrear}
      onClose={() => setAbrirModalCrear(false)}
      onGuardado={handleGuardado}
      />

      <ModalCrearPago      
        open={abrirModalCrearPago}
        onClose={() => setAbrirModalCrearPago(false)}
        onGuardado={handleGuardado}
        idVenta={ventaIdSeleccionada}
        monto={montoSeleccionado}
      />
    </>
  );
};
