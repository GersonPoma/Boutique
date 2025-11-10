import { useEffect, useState } from 'react';
import { getUsuarios } from '../../api/usuarios';
import type { Usuario } from '../../types/usuario';
import type { PageResponse } from '../../types/pagination';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Button, Box, IconButton, TableFooter
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ModalFormCrearEditar } from './ModalFormCrearEditar';
import { ModalDesactivar } from './ModalDesactivar';

export const Usuarios = () => {
  const [datosPagina, setDatosPagina] = useState<PageResponse<Usuario> | null>(null);
  const [pagina, setPagina] = useState(0);

  const [abrirForm, setAbrirForm] = useState(false);
  const [abrirDesactivar, setAbrirDesactivar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

  const cargarPagina = async (numPagina: number) => {
    try {
      const data = await getUsuarios(numPagina);
      setDatosPagina(data);
      setPagina(data.number); // backend es 0-based
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  useEffect(() => {
    cargarPagina(0);
  }, []);

  const handleAbrirCrear = () => {
    setUsuarioSeleccionado(null);
    setAbrirForm(true);
  };

  const handleAbrirEditar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setAbrirForm(true);
  };

  const handleAbrirDesactivar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setAbrirDesactivar(true);
  };

  const handleGuardado = () => {
    setAbrirForm(false);
    cargarPagina(pagina);
  };

  const handleDesactivado = () => {
    setAbrirDesactivar(false);
    cargarPagina(pagina);
  };

  const handlePaginaAnterior = () => {
    if (pagina > 0) cargarPagina(pagina - 1);
  };

  const handlePaginaSiguiente = () => {
    if (datosPagina && pagina < datosPagina.totalPages - 1) cargarPagina(pagina + 1);
  };

  const usuarios = datosPagina?.content ?? [];

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAbrirCrear}>
          Crear usuario
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">ID</TableCell>
            <TableCell align="center">Username</TableCell>
            <TableCell align="center">Rol</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map(u => (
            <TableRow key={u.id}>
              <TableCell align="center">{u.id}</TableCell>
              <TableCell align="center">{u.username}</TableCell>
              <TableCell align="center">{u.rol}</TableCell>
              <TableCell align="center">
                <IconButton color="primary" onClick={() => handleAbrirEditar(u)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleAbrirDesactivar(u)}>
                  <BlockIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} align="center">
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

      <ModalFormCrearEditar
        open={abrirForm}
        onClose={() => setAbrirForm(false)}
        onGuardado={handleGuardado}
        user={usuarioSeleccionado}
      />

      <ModalDesactivar
        open={abrirDesactivar}
        onClose={() => setAbrirDesactivar(false)}
        onConfirmado={handleDesactivado}
        user={usuarioSeleccionado}
      />
    </>
  );
};
