import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  TableFooter,
  Chip,
  AppBar,
  Toolbar,
  Button,
  Container,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CartContext';
import type { PageResponse } from '../../types/pagination';
import type { Venta } from '../../types/venta';
import { EstadoVenta } from '../../types/venta';
import {
  getVentasCompletadas,
  getVentasPagandoCredito,
  getVentasCanceladas
} from '../../api/ventas';
import { ModalDetalleVenta } from '../ventas/ModalDetalleVenta';

export const MisCompras = () => {
  const { user, logout } = useAuth();
  const { cantidad } = useCarrito();
  const navigate = useNavigate();
  
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoVenta>(EstadoVenta.COMPLETADA);
  const [datosPagina, setDatosPagina] = useState<PageResponse<Venta> | null>(null);
  const [pagina, setPagina] = useState(0);
  
  const [abrirDetalle, setAbrirDetalle] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    cargarPagina(0);
  }, [estadoSeleccionado]);

  const cargarPagina = async (numPagina: number) => {
    try {
      let data: PageResponse<Venta>;
      
      switch (estadoSeleccionado) {
        case EstadoVenta.COMPLETADA:
          data = await getVentasCompletadas(numPagina, null);
          break;
        case EstadoVenta.PAGANDO_CREDITO:
          data = await getVentasPagandoCredito(numPagina, null);
          break;
        case EstadoVenta.CANCELADA:
          data = await getVentasCanceladas(numPagina, null);
          break;
        default:
          data = await getVentasCompletadas(numPagina, null);
      }
      
      setDatosPagina(data);
      setPagina(data.number);
    } catch (error) {
      console.error('Error al obtener ventas:', error);
    }
  };

  const handleCambiarTab = (_: React.SyntheticEvent, nuevoEstado: EstadoVenta) => {
    setEstadoSeleccionado(nuevoEstado);
  };

  const handleVerDetalle = (ventaId: number) => {
    setVentaSeleccionada(ventaId);
    setAbrirDetalle(true);
  };

  const handlePaginaAnterior = () => {
    if (pagina > 0) {
      cargarPagina(pagina - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    if (datosPagina && pagina < datosPagina.totalPages - 1) {
      cargarPagina(pagina + 1);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/catalogo');
  };

  const ventas = datosPagina?.content ?? [];

  const getEstadoColor = (estado: EstadoVenta) => {
    switch (estado) {
      case EstadoVenta.COMPLETADA:
        return 'success';
      case EstadoVenta.PAGANDO_CREDITO:
        return 'warning';
      case EstadoVenta.CANCELADA:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Boutique - Mis Compras
          </Typography>
          
          <Button
            color="inherit"
            startIcon={<StorefrontIcon />}
            onClick={() => navigate('/catalogo')}
            sx={{ mr: 2 }}
          >
            Catálogo
          </Button>

          <IconButton color="inherit" onClick={() => navigate('/carrito')}>
            <Badge badgeContent={cantidad} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          <Button
            color="inherit"
            onClick={handleMenuOpen}
            startIcon={<AccountCircleIcon />}
            sx={{ ml: 2 }}
          >
            {user?.username || 'Mi Cuenta'}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <ShoppingBagIcon sx={{ mr: 1 }} />
              Mis Compras
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Mis Compras
        </Typography>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={estadoSeleccionado}
          onChange={handleCambiarTab}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Completadas" value={EstadoVenta.COMPLETADA} />
          <Tab label="Pagando a Crédito" value={EstadoVenta.PAGANDO_CREDITO} />
          <Tab label="Canceladas" value={EstadoVenta.CANCELADA} />
        </Tabs>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">Fecha</TableCell>
                <TableCell align="center">Hora</TableCell>
                <TableCell align="center">Total</TableCell>
                <TableCell align="center">Tipo de Venta</TableCell>
                <TableCell align="center">Tipo de Pago</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ventas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="text.secondary" py={4}>
                      No tienes compras en esta categoría
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ventas.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell align="center">{venta.id}</TableCell>
                    <TableCell align="center">
                      {new Date(venta.fecha).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(venta.hora).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell align="center">${venta.total.toFixed(2)}</TableCell>
                    <TableCell align="center">{venta.tipoVenta}</TableCell>
                    <TableCell align="center">{venta.tipoPago}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={venta.estado}
                        color={getEstadoColor(venta.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleVerDetalle(venta.id)}
                      >
                        <RemoveRedEyeIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TableCell colSpan={8} align="center">
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
        </CardContent>
      </Card>

      <ModalDetalleVenta
        open={abrirDetalle}
        onClose={() => setAbrirDetalle(false)}
        ventaId={ventaSeleccionada}
      />
      </Container>
    </Box>
  );
};
