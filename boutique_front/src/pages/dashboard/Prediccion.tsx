import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { getPrediccion } from '../../api/prediccion';
import type { PrediccionResponse } from '../../types/prediccion';
import { useEffect, useState, type FC } from 'react';


// --- Sub-componente para Selector de Fecha Manual ---
interface DateSelectorProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

const DateSelector: FC<DateSelectorProps> = ({ label, value, onChange }) => {
  const daysInMonth = new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  // Generamos años desde el actual hasta 5 años más
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  const handleChange = (type: 'day' | 'month' | 'year', newVal: number) => {
    const newDate = new Date(value);
    if (type === 'day') newDate.setDate(newVal);
    if (type === 'month') newDate.setMonth(newVal);
    if (type === 'year') newDate.setFullYear(newVal);
    onChange(newDate);
  };

  return (
    <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>{label}</Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Día</InputLabel>
            <Select
              value={value.getDate()}
              label="Día"
              onChange={(e) => handleChange('day', Number(e.target.value))}
            >
              {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Mes</InputLabel>
            <Select
              value={value.getMonth()}
              label="Mes"
              onChange={(e) => handleChange('month', Number(e.target.value))}
            >
              {months.map((m, idx) => <MenuItem key={idx} value={idx}>{m}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Año</InputLabel>
            <Select
              value={value.getFullYear()}
              label="Año"
              onChange={(e) => handleChange('year', Number(e.target.value))}
            >
              {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

// --- Componente Principal ---
export const Prediccion = () => {
  // Estados para fechas
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(new Date());

  // Estados para filtros
  const [genero, setGenero] = useState('');
  const [marca, setMarca] = useState('');
  const [tipoPrenda, setTipoPrenda] = useState('');
  const [topN, setTopN] = useState<string>('10');

  // Estado para datos y carga
  const [data, setData] = useState<PrediccionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar fechas: Próximo mes por defecto
  useEffect(() => {
    const hoy = new Date();
    // Inicio: 1er día del próximo mes
    const inicioMesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    // Fin: Último día del próximo mes
    const finMesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);
    
    setFechaInicio(inicioMesSiguiente);
    setFechaFin(finMesSiguiente);
    
    // Llamada inicial automática
    fetchData(inicioMesSiguiente, finMesSiguiente);
  }, []);

  const fetchData = async (inicio?: Date, fin?: Date) => {
    setLoading(true);
    setError(null);
    
    const fInicio = inicio || fechaInicio;
    const fFin = fin || fechaFin;

    // Formato YYYY-MM-DD
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    try {
      const response = await getPrediccion(
        formatDate(fInicio),
        formatDate(fFin),
        genero || null,
        marca || null,
        tipoPrenda || null,
        topN ? Number(topN) : null
      );
      setData(response);
    } catch (err) {
      console.error(err);
      setError("Error al obtener predicciones.");
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear fecha DD-MM-YYYY
  const formatDateDisplay = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Predicción de Demanda
      </Typography>

      {/* Mensaje de rango de fechas */}
      {data && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Predicción para el período:</strong> {formatDateDisplay(fechaInicio)} al {formatDateDisplay(fechaFin)}
          </Typography>
        </Alert>
      )}
      
      {/* --- Filtros --- */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Selectores de Fechas Manuales */}
          <Grid size={{ xs: 12, md: 6 }}>
             <DateSelector label="Fecha Inicio" value={fechaInicio} onChange={setFechaInicio} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
             <DateSelector label="Fecha Fin" value={fechaFin} onChange={setFechaFin} />
          </Grid>

          {/* Inputs de Texto */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField 
              fullWidth label="Género" variant="outlined" 
              value={genero} onChange={(e) => setGenero(e.target.value)} 
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField 
              fullWidth label="Marca" variant="outlined" 
              value={marca} onChange={(e) => setMarca(e.target.value)} 
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField 
              fullWidth label="Tipo de Prenda" variant="outlined" 
              value={tipoPrenda} onChange={(e) => setTipoPrenda(e.target.value)} 
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField 
              fullWidth label="Top N" type="number" variant="outlined" 
              value={topN} onChange={(e) => setTopN(e.target.value)} 
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => fetchData()}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Calculando...' : 'Generar Predicción'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* --- Mensajes de Error o Carga --- */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* --- Resultados --- */}
      {data && (
        <Box>
          {/* Tarjetas de Resumen */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#e3f2fd' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Unidades</Typography>
                  <Typography variant="h4">{data.resumen.totalUnidadesPredichas}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Ingreso Estimado</Typography>
                  <Typography variant="h4">${data.resumen.totalIngresoPredicho}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#fff3e0' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Productos Analizados</Typography>
                  <Typography variant="h4">{data.resumen.totalProductosPredichos}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de Detalles */}
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>Detalle de Productos</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Ranking</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell>Marca</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Predicción (U)</TableCell>
                  <TableCell align="right">Confianza</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.resultados.map((row) => (
                  <TableRow key={row.productoId}>
                    <TableCell>{row.ranking}</TableCell>
                    <TableCell>{row.productoNombre}</TableCell>
                    <TableCell>{row.marca || '-'}</TableCell>
                    <TableCell>{row.tipoPrenda || '-'}</TableCell>
                    <TableCell align="right">${row.precio}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.cantidadPredicha}</TableCell>
                    <TableCell align="right">{row.confianza}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};