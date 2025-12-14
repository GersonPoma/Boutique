import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Grid,
  Divider,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CardMedia
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import sinImagen from '../../assets/sin-imagen.png';

export const Carrito = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { carrito, eliminarDelCarrito, actualizarCantidad, limpiarCarrito, total, cantidad } = useCarrito();

  const handleProcederPago = () => {
    if (!user) {
      // Si no hay usuario autenticado, redirigir a login
      navigate('/login', { state: { from: '/carrito' } });
    } else {
      // Si está autenticado, proceder al pago
      navigate('/checkout');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar público */}
      <AppBar position="sticky" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => navigate('/catalogo')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mi Carrito ({cantidad} {cantidad === 1 ? 'producto' : 'productos'})
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, pb: 4 }}>
        {carrito.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Tu carrito está vacío
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Agrega productos desde nuestro catálogo
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/catalogo')}
              sx={{ mt: 2 }}
            >
              Ver Catálogo
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Lista de productos */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Productos en tu carrito</Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={limpiarCarrito}
                      startIcon={<DeleteIcon />}
                    >
                      Vaciar carrito
                    </Button>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="center">Precio</TableCell>
                        <TableCell align="center">Cantidad</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {carrito.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <CardMedia
                                component="img"
                                image={item.imagenUrl || sinImagen}
                                alt={item.nombre}
                                sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                              />
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {item.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.marca} | Talla: {item.talla}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          
                          <TableCell align="center">
                            ${item.precio.toFixed(2)}
                          </TableCell>
                          
                          <TableCell align="center">
                            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                              <IconButton
                                size="small"
                                onClick={() => actualizarCantidad(item.id!, item.cantidad - 1)}
                                disabled={item.cantidad <= 1}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              
                              <TextField
                                value={item.cantidad}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val > 0) {
                                    actualizarCantidad(item.id!, val);
                                  }
                                }}
                                size="small"
                                sx={{ width: 60 }}
                                inputProps={{ style: { textAlign: 'center' } }}
                              />
                              
                              <IconButton
                                size="small"
                                onClick={() => actualizarCantidad(item.id!, item.cantidad + 1)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="medium">
                              ${(item.precio * item.cantidad).toFixed(2)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => eliminarDelCarrito(item.id!)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            {/* Resumen del pedido */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ position: 'sticky', top: 80 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumen del Pedido
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body1">Subtotal:</Typography>
                    <Typography variant="body1">${total.toFixed(2)}</Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Productos: {cantidad}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartCheckoutIcon />}
                    onClick={handleProcederPago}
                  >
                    Proceder al Pago
                  </Button>
                  
                  {!user && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={2} textAlign="center">
                      Debes iniciar sesión para completar tu compra
                    </Typography>
                  )}
                  
                  <Button
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/catalogo')}
                  >
                    Seguir Comprando
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};
