import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { EstadisticasVentas } from '../../types/venta';
import { estadisticaVentas } from '../../api/reportes';

export const EstadisticaVentas = () => {
  const [data, setData] = useState<EstadisticasVentas[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await estadisticaVentas();
      setData(response);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las estadísticas de ventas');
    } finally {
      setLoading(false);
    }
  };

  // Helper para convertir (2024, 1) -> "Ene 2024"
  const formatMes = (anio: number, mes: number) => {
    const date = new Date(anio, mes - 1, 1); // Mes en JS es 0-11
    return new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' }).format(date);
  };

  // Preparamos datos para el gráfico (agregando campo label legible)
  const chartData = data.map(item => ({
    ...item,
    label: formatMes(item.anio, item.mes), // Ej: "Nov 2023"
  }));

  // Renderizado del Tooltip personalizado para el gráfico
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" color="textSecondary">{label}</Typography>
          <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
            {payload[0].value} Ventas
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Evolución de Ventas (Últimos 13 meses)
      </Typography>

      <Grid container spacing={3}>
        {/* --- Sección Gráfico --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom color="textSecondary" sx={{ fontSize: '1rem' }}>
              Tendencia Mensual
            </Typography>
            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 12 }} 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="totalVentas" 
                    fill="#1976d2" 
                    radius={[4, 4, 0, 0]} 
                    name="Ventas"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* --- Sección Resumen / Tabla Pequeña --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detalle Numérico
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Periodo</TableCell>
                      <TableCell align="right">Ventas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Invertimos el orden para mostrar el más reciente primero en la tabla */}
                    {[...data].reverse().map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell component="th" scope="row">
                          {formatMes(row.anio, row.mes)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {row.totalVentas}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};