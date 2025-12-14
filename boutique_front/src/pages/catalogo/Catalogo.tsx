import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Badge,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Chip,
  Menu,
  Drawer
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useNavigate } from 'react-router-dom';
import type { Producto } from '../../types/producto';
import { Marca, Genero, TipoPrenda, Talla, Temporada, Uso } from '../../types/producto';
import { getCatalogo, buscarCatalogo, getStockProducto } from '../../api/catalogo';
import { useCarrito } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import sinImagen from '../../assets/sin-imagen.png';

export const Catalogo = () => {
  const navigate = useNavigate();
  const { agregarAlCarrito, cantidad } = useCarrito();
  const { user, logout } = useAuth();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stocks, setStocks] = useState<Map<number, number>>(new Map());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [marca, setMarca] = useState<Marca | ''>('');
  const [genero, setGenero] = useState<Genero | ''>('');
  const [tipoPrenda, setTipoPrenda] = useState<TipoPrenda | ''>('');
  const [talla, setTalla] = useState<Talla | ''>('');
  const [temporada, setTemporada] = useState<Temporada | ''>('');
  const [uso, setUso] = useState<Uso | ''>('');

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    cargarProductos();
  }, [page]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const hayFiltros = marca || genero || tipoPrenda || talla || temporada || uso;

      if (hayFiltros) {
        response = await buscarCatalogo({
          marca: marca || undefined,
          genero: genero || undefined,
          tipoPrenda: tipoPrenda || undefined,
          talla: talla || undefined,
          temporada: temporada || undefined,
          uso: uso || undefined,
          page
        });
      } else {
        response = await getCatalogo(page);
      }

      if (page === 0) {
        setProductos(response.content);
      } else {
        setProductos(prev => [...prev, ...response.content]);
      }

      setHasMore(page < response.totalPages - 1);

      // Cargar stock para los nuevos productos
      response.content.forEach(async (producto) => {
        if (producto.id) {
          try {
            const stock = await getStockProducto(1, producto.id);
            setStocks(prev => new Map(prev).set(producto.id!, stock));
          } catch (err) {
            console.error(`Error al obtener stock para producto ${producto.id}:`, err);
          }
        }
      });

    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar el catálogo');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setPage(0);
    setProductos([]);
    setHasMore(true);
    cargarProductos();
  };

  const limpiarFiltros = () => {
    setMarca('');
    setGenero('');
    setTipoPrenda('');
    setTalla('');
    setTemporada('');
    setUso('');
    setPage(0);
    setProductos([]);
    setHasMore(true);
  };

  const handleAgregarAlCarrito = (producto: Producto) => {
    const stock = stocks.get(producto.id!) || 0;
    if (stock > 0) {
      agregarAlCarrito(producto);
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

  const handleMisCompras = () => {
    handleMenuClose();
    navigate('/mis-compras');
  };

  // Funciones de formateo para mostrar valores legibles
  const formatearTalla = (talla: string | null) => {
    if (!talla) return '';
    // Si viene NUM_6, NUM_7_5, etc., extraer solo el número
    if (talla.startsWith('NUM_')) {
      return talla.replace('NUM_', '').replace('_', '.');
    }
    // Para valores que ya vienen formateados o tallas normales
    return talla;
  };

  const formatearGenero = (genero: string | null) => {
    if (!genero) return '';
    // Mapeo de llaves a valores legibles
    const mapeo: { [key: string]: string } = {
      'NINO': 'NIÑO',
      'NINA': 'NIÑA',
      'HOMBRE': 'HOMBRE',
      'MUJER': 'MUJER',
      'UNISEX': 'UNISEX'
    };
    return mapeo[genero] || genero;
  };

  const formatearMarca = (marca: string | null) => {
    if (!marca) return '';
    // Reemplazar guiones bajos con espacios
    return marca.replace(/_/g, ' ');
  };

  const hayFiltrosActivos = marca || genero || tipoPrenda || talla || temporada || uso;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar público */}
      <AppBar position="sticky" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Boutique - Catálogo
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            sx={{ mr: 2 }}
          >
            <FilterListIcon />
          </IconButton>

          <IconButton color="inherit" onClick={() => navigate('/carrito')}>
            <Badge badgeContent={cantidad} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {user ? (
            <>
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                startIcon={<AccountCircleIcon />}
                sx={{ ml: 2 }}
              >
                {user.username || 'Mi Cuenta'}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMisCompras}>
                  <ShoppingBagIcon sx={{ mr: 1 }} />
                  Mis Compras
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')} sx={{ ml: 2 }}>
              Iniciar Sesión
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer de filtros */}
      <Drawer
        anchor="top"
        open={mostrarFiltros}
        onClose={() => setMostrarFiltros(false)}
        sx={{
          '& .MuiDrawer-paper': {
            marginTop: '64px', // Altura del AppBar
          }
        }}
      >
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', width: '100%' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Filtros</Typography>
            {hayFiltrosActivos && (
              <Button
                startIcon={<ClearIcon />}
                onClick={limpiarFiltros}
                size="small"
              >
                Limpiar
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TextField
                select
                fullWidth
                label="Marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value as Marca)}
                size="small"
              >
                <MenuItem value="">Todas</MenuItem>
                {Object.values(Marca).map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TextField
                select
                fullWidth
                label="Género"
                value={genero}
                onChange={(e) => setGenero(e.target.value as Genero)}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.values(Genero).map(g => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TextField
                select
                fullWidth
                label="Tipo de Prenda"
                value={tipoPrenda}
                onChange={(e) => setTipoPrenda(e.target.value as TipoPrenda)}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.values(TipoPrenda).map(tp => (
                  <MenuItem key={tp} value={tp}>{tp}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TextField
                select
                fullWidth
                label="Talla"
                value={talla}
                onChange={(e) => setTalla(e.target.value as Talla)}
                size="small"
              >
                <MenuItem value="">Todas</MenuItem>
                {Object.values(Talla).map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TextField
                select
                fullWidth
                label="Temporada"
                value={temporada}
                onChange={(e) => setTemporada(e.target.value as Temporada)}
                size="small"
              >
                <MenuItem value="">Todas</MenuItem>
                {Object.values(Temporada).map(temp => (
                  <MenuItem key={temp} value={temp}>{temp}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TextField
                select
                fullWidth
                label="Uso"
                value={uso}
                onChange={(e) => setUso(e.target.value as Uso)}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.values(Uso).map(u => (
                  <MenuItem key={u} value={u}>{u}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
            <Button 
              variant="outlined"
              onClick={() => setMostrarFiltros(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained"
              onClick={() => {
                aplicarFiltros();
                setMostrarFiltros(false);
              }}
            >
              Aplicar
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Grid de productos */}
        <Grid container spacing={3}>
          {productos.map((producto, index) => {
            const stock = stocks.get(producto.id!) || 0;
            const sinStock = stock === 0;

            return (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}
                key={`${producto.id}-${index}`}
                ref={index === productos.length - 1 ? lastProductRef : null}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: sinStock ? 0.6 : 1,
                    position: 'relative'
                  }}
                >
                  {sinStock && (
                    <Chip
                      label="Sin Stock"
                      color="error"
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                    />
                  )}
                  
                  <CardMedia
                    component="img"
                    height="200"
                    image={producto.imagenUrl || sinImagen}
                    alt={producto.nombre}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {producto.nombre}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatearMarca(producto.marca)}
                    </Typography>
                    
                    <Typography variant="h6" color="primary" gutterBottom>
                      {producto.precio.toFixed(2)} Bs.
                    </Typography>

                    <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
                      {producto.talla && (
                        <Chip label={formatearTalla(producto.talla)} size="small" />
                      )}
                      {producto.genero && (
                        <Chip label={formatearGenero(producto.genero)} size="small" />
                      )}
                    </Box>

                    {stock > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Stock disponible: {stock}
                      </Typography>
                    )}
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => handleAgregarAlCarrito(producto)}
                      disabled={sinStock}
                    >
                      Agregar al Carrito
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Loading indicator */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && productos.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron productos
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
