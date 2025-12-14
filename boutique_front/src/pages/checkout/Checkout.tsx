import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Grid,
  Divider,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { TipoPago, TipoVenta } from '../../types/venta';
import type { PlanCredito } from '../../types/plan_credito';
import { getPlanesCredito } from '../../api/plan_credito';
import { crearVenta } from '../../api/ventas';

const steps = ['Método de pago', 'Información de pago', 'Confirmación'];

export const Checkout = () => {
  const navigate = useNavigate();
  const { carrito, total, limpiarCarrito } = useCarrito();
  const { user } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [tipoPago, setTipoPago] = useState<TipoPago>(TipoPago.CONTADO);
  const [planesCredito, setPlanesCredito] = useState<PlanCredito[]>([]);
  const [planSeleccionado, setPlanSeleccionado] = useState<number | null>(null);
  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'qr'>('tarjeta');
  
  // Datos de tarjeta (simulación)
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [cvv, setCvv] = useState('');

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [pagoExitoso, setPagoExitoso] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (carrito.length === 0) {
      navigate('/catalogo');
    }

    cargarPlanesCredito();
  }, []);

  const cargarPlanesCredito = async () => {
    try {
      const planes = await getPlanesCredito();
      setPlanesCredito(planes.filter(p => p.activo));
    } catch (err) {
      console.error('Error al cargar planes de crédito:', err);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && tipoPago === TipoPago.CREDITO && !planSeleccionado) {
      setError('Por favor seleccione un plan de crédito');
      return;
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const calcularMontoCuota = (plan: PlanCredito) => {
    const tasaMensual = (plan.interesAnual / 100) / 12;
    const montoCuota = (total * tasaMensual * Math.pow(1 + tasaMensual, plan.plazo)) / 
                       (Math.pow(1 + tasaMensual, plan.plazo) - 1);
    return montoCuota;
  };

  const handleProcesarPago = async () => {
    setError('');

    // Validaciones
    if (metodoPago === 'tarjeta') {
      if (!numeroTarjeta || !nombreTitular || !fechaExpiracion || !cvv) {
        setError('Por favor complete todos los campos de la tarjeta');
        return;
      }
      if (numeroTarjeta.replace(/\s/g, '').length !== 16) {
        setError('El número de tarjeta debe tener 16 dígitos');
        return;
      }
      if (cvv.length !== 3) {
        setError('El CVV debe tener 3 dígitos');
        return;
      }
    }

    setProcesando(true);

    try {
      // Simular procesamiento de pago (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear la venta
      const detalles = carrito.map(item => ({
        id: null,
        cantidad: item.cantidad,
        precioUnitario: item.precio || 0,
        subTotal: (item.precio || 0) * item.cantidad,
        idVenta: null,
        idProducto: item.id!,
        nombreProducto: null,
        imagenUrl: null
      }));

      const ventaData = {
        id: null,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0],
        total,
        tipoVenta: TipoVenta.ONLINE,
        tipoPago,
        estado: null,
        observaciones: `Pago online - ${metodoPago === 'tarjeta' ? 'Tarjeta' : 'QR'}`,
        idCliente: user!.id,
        clienteNombre: null,
        idSucursal: 1, // Sucursal por defecto para ventas online
        sucursalNombre: null,
        detalles,
        credito: null,
        idPlanCredito: tipoPago === TipoPago.CREDITO ? planSeleccionado : null
      };

      await crearVenta(ventaData);

      setPagoExitoso(true);
      limpiarCarrito();
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/mis-compras');
      }, 3000);

    } catch (err: any) {
      console.error('Error al procesar pago:', err);
      setError(err.response?.data?.message || 'Error al procesar el pago. Por favor intente nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  const formatearNumeroTarjeta = (valor: string) => {
    const numeros = valor.replace(/\s/g, '');
    const grupos = numeros.match(/.{1,4}/g);
    return grupos ? grupos.join(' ') : '';
  };

  const handleNumeroTarjetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(valor) && valor.length <= 16) {
      setNumeroTarjeta(formatearNumeroTarjeta(valor));
    }
  };

  const renderPasoMetodoPago = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Seleccione el método de pago
      </Typography>

      <RadioGroup value={tipoPago} onChange={(e) => setTipoPago(e.target.value as TipoPago)}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <FormControlLabel
              value={TipoPago.CONTADO}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Pago al Contado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pague el monto total ahora
                  </Typography>
                  <Typography variant="h6" color="primary" mt={1}>
                    Bs. {total.toFixed(2)}
                  </Typography>
                </Box>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <FormControlLabel
              value={TipoPago.CREDITO}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Pago a Crédito
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Financie su compra en cuotas
                  </Typography>
                </Box>
              }
            />

            {tipoPago === TipoPago.CREDITO && (
              <Box mt={2} ml={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Seleccione un plan de crédito:
                </Typography>
                <RadioGroup
                  value={planSeleccionado}
                  onChange={(e) => setPlanSeleccionado(Number(e.target.value))}
                >
                  {planesCredito.map(plan => (
                    <Card key={plan.id} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <FormControlLabel
                          value={plan.id}
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {plan.nombre}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {plan.descripcion}
                              </Typography>
                              <Grid container spacing={2} mt={0.5}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Plazo
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {plan.plazo} meses
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Frecuencia
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {plan.frecuencia}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Interés anual
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {plan.interesAnual}%
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Cuota mensual aprox.
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium" color="primary">
                                    Bs. {calcularMontoCuota(plan).toFixed(2)}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          }
                        />
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </Box>
            )}
          </CardContent>
        </Card>
      </RadioGroup>
    </Box>
  );

  const renderPasoInformacionPago = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Información de pago
      </Typography>

      <RadioGroup value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as 'tarjeta' | 'qr')}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                cursor: 'pointer',
                border: metodoPago === 'tarjeta' ? 2 : 1,
                borderColor: metodoPago === 'tarjeta' ? 'primary.main' : 'divider'
              }}
              onClick={() => setMetodoPago('tarjeta')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <CreditCardIcon sx={{ fontSize: 48, mb: 1, color: 'primary.main' }} />
                <FormControlLabel
                  value="tarjeta"
                  control={<Radio />}
                  label="Tarjeta de Crédito/Débito"
                  sx={{ display: 'block' }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                cursor: 'pointer',
                border: metodoPago === 'qr' ? 2 : 1,
                borderColor: metodoPago === 'qr' ? 'primary.main' : 'divider'
              }}
              onClick={() => setMetodoPago('qr')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <QrCodeIcon sx={{ fontSize: 48, mb: 1, color: 'primary.main' }} />
                <FormControlLabel
                  value="qr"
                  control={<Radio />}
                  label="Pago con QR"
                  sx={{ display: 'block' }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </RadioGroup>

      <Box mt={3}>
        {metodoPago === 'tarjeta' ? (
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Número de Tarjeta"
                    value={numeroTarjeta}
                    onChange={handleNumeroTarjetaChange}
                    placeholder="1234 5678 9012 3456"
                    inputProps={{ maxLength: 19 }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Nombre del Titular"
                    value={nombreTitular}
                    onChange={(e) => setNombreTitular(e.target.value.toUpperCase())}
                    placeholder="NOMBRE COMPLETO"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Fecha de Expiración"
                    value={fechaExpiracion}
                    onChange={(e) => {
                      let valor = e.target.value.replace(/\D/g, '');
                      if (valor.length >= 2) {
                        valor = valor.slice(0, 2) + '/' + valor.slice(2, 4);
                      }
                      setFechaExpiracion(valor);
                    }}
                    placeholder="MM/AA"
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="CVV"
                    value={cvv}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      if (valor.length <= 3) setCvv(valor);
                    }}
                    placeholder="123"
                    type="password"
                    inputProps={{ maxLength: 3 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : (
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <QrCodeIcon sx={{ fontSize: 120, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Escanee el código QR
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Use su aplicación de banca móvil para escanear el código y completar el pago
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                Bs. {total.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );

  const renderPasoConfirmacion = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Confirme su compra
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Resumen de productos
          </Typography>
          {carrito.map(item => (
            <Box key={item.id} display="flex" justifyContent="space-between" py={1}>
              <Typography variant="body2">
                {item.nombre} x {item.cantidad}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                Bs. {((item.precio || 0) * item.cantidad).toFixed(2)}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight="bold">
              Total
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              Bs. {total.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Método de pago
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {tipoPago === TipoPago.CONTADO ? 'Pago al Contado' : 'Pago a Crédito'}
          </Typography>
          {tipoPago === TipoPago.CREDITO && planSeleccionado && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Plan: {planesCredito.find(p => p.id === planSeleccionado)?.nombre}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" mt={1}>
            Vía: {metodoPago === 'tarjeta' ? 'Tarjeta' : 'Código QR'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => navigate('/carrito')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Finalizar Compra
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          {activeStep === 0 && renderPasoMetodoPago()}
          {activeStep === 1 && renderPasoInformacionPago()}
          {activeStep === 2 && renderPasoConfirmacion()}
        </Paper>

        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Atrás
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleProcesarPago}
              disabled={procesando}
              startIcon={procesando ? <CircularProgress size={20} /> : null}
            >
              {procesando ? 'Procesando...' : 'Confirmar y Pagar'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Siguiente
            </Button>
          )}
        </Box>
      </Container>

      {/* Diálogo de éxito */}
      <Dialog open={pagoExitoso} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold">
            ¡Pago Exitoso!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            Su compra ha sido procesada exitosamente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirigiendo a sus compras...
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
