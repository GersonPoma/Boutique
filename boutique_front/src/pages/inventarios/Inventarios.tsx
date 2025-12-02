import { useEffect, useState } from 'react';
import type { PageResponse } from '../../types/pagination';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Button, Box, IconButton, TableFooter,
  TextField,
  MenuItem
} from '@mui/material';
import sinImagen from '../../assets/sin-imagen.png';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getInventarios, getInventariosBySucursal } from '../../api/inventario';
import type { Inventario } from '../../types/inventario';
import { ModalFormCrearEditar } from './ModalFormCrearEditar';
import { ModalEliminar } from './ModalEliminar';
import { useAuth } from '../../context/AuthContext';
import type { Sucursal } from '../../types/sucursal';
import { getSucursales } from '../../api/sucursales';

export const Inventarios = () => {
  const { user } = useAuth();

  const [datosPagina, setDatosPagina] = useState<PageResponse<Inventario> | null>(null);
  const [pagina, setPagina] = useState(0);

  const [abrirForm, setAbrirForm] = useState(false);
  const [abrirEliminar, setAbrirEliminar] = useState(false);
  const [inventarioSeleccionado, setInventarioSeleccionado] = useState<Inventario | null>(null);

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number | ''>('');

  const esAdmin = user?.rol === 'ADMIN';
  const esInventarista = user?.rol === 'INVENTARISTA';

  const cantidadColumnas = (esAdmin || esInventarista) ? 6 : 5;

  // Cargar sucursales si es admin  
  useEffect(() => {
    if (esAdmin || esInventarista) {
      fetchSucursales();
    }
  }, [esAdmin, esInventarista]);

  const fetchSucursales = async () => {
    try {
      const data = await getSucursales();
      setSucursales(data);
    } catch (error) {
      console.error('Error al obtener sucursales:', error);
    }
  };
  
  useEffect(() => {
    if (esAdmin || esInventarista) {
      cargarPagina(0);
    } else if (user?.id_sucursal) {
      cargarPaginaSucursal(user.id_sucursal, 0);
    }
    console.log('User in Inventarios:', user);
  }, []);
  
  const cargarPagina = async (numPagina: number) => {
    try {
      const data = await getInventarios(numPagina);
      setDatosPagina(data);
      setPagina(data.number); // backend es 0-based
    } catch (error) {
      console.error("Error al obtener inventarios:", error);
    }
  };

  const cargarPaginaSucursal = async (idSucursal: number, numPagina: number) => {
    try {
      const data = await getInventariosBySucursal(idSucursal, numPagina);
      setDatosPagina(data);
      setPagina(data.number);
    } catch (error) {
      console.error("Error al obtener inventarios por sucursal:", error);
    }
  };

  const handleSucursalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (value === '') {
      setSucursalSeleccionada('');
      cargarPagina(0);
      return;
    }

    const id = Number(value);
    setSucursalSeleccionada(id);
    if (id > 0) {
      cargarPaginaSucursal(id, 0);
    }
  };

  const handleAbrirCrear = () => {
    setInventarioSeleccionado(null);
    setAbrirForm(true);
  };

  const handleAbrirEditar = (inventario: Inventario) => {
    setInventarioSeleccionado(inventario);
    setAbrirForm(true);
  };

  const handleAbrirEliminar = (inventario: Inventario) => {
    setInventarioSeleccionado(inventario);
    setAbrirEliminar(true);
  };

  const handleGuardado = () => {
    setAbrirForm(false);
    (esAdmin || esInventarista) && sucursalSeleccionada
      ? cargarPaginaSucursal(Number(sucursalSeleccionada), pagina)
      : user?.id_sucursal
        ? cargarPaginaSucursal(user.id_sucursal, pagina)
        : cargarPagina(pagina);
  };

  // const handleEliminado = () => {
  //   setAbrirEliminar(false);
  //   cargarPagina(pagina);
  // };

  const handleEliminado = () => {
    setAbrirEliminar(false);
    if ((esAdmin || esInventarista) && sucursalSeleccionada) {
      cargarPaginaSucursal(Number(sucursalSeleccionada), pagina);
    } else if (user?.id_sucursal) {
      cargarPaginaSucursal(user.id_sucursal, pagina);
    } else {
      cargarPagina(pagina);
    }
  };

  const handlePaginaAnterior = () => {
    if (pagina > 0) {
      if ((esAdmin || esInventarista) && sucursalSeleccionada)
        cargarPaginaSucursal(Number(sucursalSeleccionada), pagina - 1);
      else if (user?.id_sucursal)
        cargarPaginaSucursal(user.id_sucursal, pagina - 1);
      else cargarPagina(pagina - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    if (datosPagina && pagina < datosPagina.totalPages - 1) {
      if ((esAdmin || esInventarista) && sucursalSeleccionada)
        cargarPaginaSucursal(Number(sucursalSeleccionada), pagina + 1);
      else if (user?.id_sucursal)
        cargarPaginaSucursal(user.id_sucursal, pagina + 1);
      else cargarPagina(pagina + 1);
    }
  };

  const usuarios = datosPagina?.content ?? [];

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Gestión de Inventarios</Typography>
        {(esAdmin || esInventarista) && ( 
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAbrirCrear}
          >
            Crear inventario
          </Button>
        )}
      </Box>

      {/* Filtro de sucursal solo para admin */}
      {(esAdmin || esInventarista) && (
        <Box mb={2}>
          <TextField
            select
            label="Filtrar por sucursal"
            value={sucursalSeleccionada}
            onChange={handleSucursalChange}
            size="small"
            sx={{ width: { xs: '100%', sm: 280 } }}  // 280px en pantallas ≥ sm; 100% en móvil
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

      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">ID</TableCell>
            <TableCell align="center">Imagen</TableCell>
            <TableCell align="center">Producto</TableCell>
            <TableCell align="center">Stock</TableCell>
            <TableCell align="center">Sucursal</TableCell>
            {(esAdmin || esInventarista) && (
              <TableCell align="center">Acciones</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map((i) => (
            <TableRow key={i.id}>
              <TableCell align="center">{i.id}</TableCell>
              <TableCell align="center">
                <Box
                  component="img"
                  src={i.imagenUrl || sinImagen}
                  alt={i.nombreProducto || "Producto"}
                  sx={{
                    width: 50,
                    height: 50,
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                />
              </TableCell>
              <TableCell>{i.nombreProducto}</TableCell>
              <TableCell align="center">{i.cantidad}</TableCell>
              <TableCell align="center">{i.nombreSucursal}</TableCell>
              {(esAdmin || esInventarista) && (
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleAbrirEditar(i)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleAbrirEliminar(i)}
                  >
                    <BlockIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={cantidadColumnas} align="center">
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                gap={2}
                my={1}
              >
                <IconButton
                  onClick={handlePaginaAnterior}
                  disabled={pagina === 0}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography>
                  Página {pagina + 1} de {datosPagina?.totalPages ?? 1}
                </Typography>
                <IconButton
                  onClick={handlePaginaSiguiente}
                  disabled={
                    datosPagina ? pagina >= datosPagina.totalPages - 1 : true
                  }
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <ModalFormCrearEditar
        open={abrirForm}
        onClose={() => setAbrirForm(false)}
        onGuardado={handleGuardado}
        inventario={inventarioSeleccionado}
      />

      <ModalEliminar
        open={abrirEliminar}
        onClose={() => setAbrirEliminar(false)}
        onConfirmado={handleEliminado}
        inventario={inventarioSeleccionado}
      />
    </>
  );
};
