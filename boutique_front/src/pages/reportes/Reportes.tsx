// src/pages/reportes/Reportes.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  Chip,
  ListItemText,
  Tabs,
  Tab,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import InfoIcon from '@mui/icons-material/Info';
import {
  generarReporteProductos,
  generarReporteVentas,
} from '../../api/reportes';
// Importamos el tipo de respuesta de Axios
import type { AxiosResponse } from 'axios';

// (Configuración de SpeechRecognition... se mantiene igual)
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
}

export const Reportes: React.FC = () => {
  const [tipoReporte, setTipoReporte] = useState<'productos' | 'ventas'>('productos');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ¡CAMBIO! Ya no guardamos datos JSON, sino un mensaje de éxito
  const [success, setSuccess] = useState<string | null>(null);

  const recognitionRef = useRef(recognition);

  useEffect(() => {
    if (!transcript) return;

    const procesarPeticion = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null); // Limpiamos el éxito anterior

      try {
        let response: AxiosResponse<Blob>;

        // Usar el tipo de reporte seleccionado en el tab
        if (tipoReporte === 'productos') {
          response = await generarReporteProductos({ text: transcript });
        } else {
          response = await generarReporteVentas({ text: transcript });
        }
        
        // --- LÓGICA DE DESCARGA ---
        
        // 1. Obtener el nombre del archivo del encabezado 'content-disposition'
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'reporte.xlsx'; // Nombre por defecto
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1]; // Ej: "reporte_productos_20251111_1832.xlsx"
          }
        }

        // 2. Obtener el Content-Type para crear el Blob correctamente
        const contentType = response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        
        console.log('📥 Descargando archivo:', filename);
        console.log('📦 Content-Type:', contentType);
        console.log('📦 Tamaño del Blob:', response.data.size);

        // 3. Crear un enlace (link) temporal en memoria con el tipo MIME correcto
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename); // Asignar el nombre del archivo
        
        // 4. Simular clic en el enlace para iniciar la descarga
        document.body.appendChild(link);
        link.click();

        // 5. Limpiar
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSuccess(`Reporte "${filename}" descargado exitosamente.`);

      } catch (err: any) {
        console.error('========== ERROR COMPLETO ==========');
        console.error('Error al generar reporte:', err);
        console.error('Respuesta del servidor:', err.response);
        console.error('Status:', err.response?.status);
        console.error('Status Text:', err.response?.statusText);
        console.error('Headers:', err.response?.headers);
        console.error('Data:', err.response?.data);
        console.error('Config:', err.config);
        console.error('====================================');
        
        const status = err.response?.status;
        const message = err.response?.data?.detail || err.message || 'Error desconocido';
        
        setError(
          `Error ${status ? `(${status})` : ''}: ${message}. Revisa la consola para más detalles.`
        );
      } finally {
        setLoading(false);
      }
    };

    procesarPeticion();
  }, [transcript, tipoReporte]);

  // (La función handleToggleListen... se mantiene igual)
  const handleToggleListen = () => {
    if (!recognitionRef.current) {
      setError(
        'La API de reconocimiento de voz no es compatible con este navegador.'
      );
      return;
    }
    const rec = recognitionRef.current;
    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setError(null);
      setSuccess(null); // Limpiamos el éxito
      rec.onresult = (event: any) => {
        setTranscript(event.results[0][0].transcript);
      };
      rec.onerror = (event: any) => {
        console.error('Error de reconocimiento:', event.error);
        setError(`Error de reconocimiento: ${event.error}`);
        setIsListening(false);
      };
      rec.onend = () => {
        setIsListening(false);
      };
      rec.start();
      setIsListening(true);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'productos' | 'ventas') => {
    setTipoReporte(newValue);
    setTranscript('');
    setError(null);
    setSuccess(null);
  };

  // Ejemplos según el tipo de reporte
  const ejemplosProductos = [
    "Dame un reporte de los productos más vendidos este mes",
    "Quiero un reporte en excel de los 10 productos más vendidos de marca nike este mes",
    "Dame un reporte en pdf de los productos de marca adidas más vendidos del mes pasado",
    "Quiero ver los 5 productos más vendidos en ventas online este año",
    "Dame un reporte de las zapatillas nike más vendidas este mes",
    "Quiero un reporte de los productos para hombre de marca puma más vendidos",
    "Dame los 20 productos más vendidos pagados a crédito este año",
    "Quiero ver los productos más baratos vendidos este mes",
    "Dame un reporte de las camisas más vendidas del mes pasado",
    "Quiero ver los top 10 productos más vendidos en ventas físicas completadas este mes",
  ];

  const ejemplosVentas = [
    "Quiero un reporte en excel de las ventas a crédito de este mes que aún se estén pagando",
    "Dame un reporte en pdf de las ventas físicas completadas del mes pasado",
    "Quiero un reporte en excel de las ventas online que superen los 500 bs hace 5 meses",
    "Dame un reporte en pdf de las ventas a contado menores a 1000 dólares del año pasado",
    "Quiero un reporte de las ventas a crédito completadas este año que superen los 2000 bolivianos",
    "Dame un reporte de las ventas online pendientes de hace 3 meses que no pasen de 1500 bs",
    "Dame un reporte en excel de las ventas físicas completadas pagados a crédito del mes pasado",
  ];

  const ejemplosActuales = tipoReporte === 'productos' ? ejemplosProductos : ejemplosVentas;

  // (El renderizado... se mantiene casi igual)
  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Reportes por Voz
      </Typography>

      {/* Tabs para seleccionar tipo de reporte */}
      <Tabs
        value={tipoReporte}
        onChange={handleTabChange}
        centered
        sx={{ mb: 3 }}
      >
        <Tab label="Reportes de Productos" value="productos" />
        <Tab label="Reportes de Ventas" value="ventas" />
      </Tabs>

      {/* Botón de Micrófono */}
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Button
          variant="contained"
          color={isListening ? 'error' : 'primary'}
          onClick={handleToggleListen}
          disabled={!recognition}
          sx={{ width: 150, height: 60 }}
          startIcon={
            loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isListening ? (
              <StopIcon />
            ) : (
              <MicIcon />
            )
          }
        >
          {loading ? 'Procesando...' : isListening ? 'Detener' : 'Escuchar'}
        </Button>
      </Box>

      {/* Ejemplos de uso */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
        <Typography variant="h6" gutterBottom>
          <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Ejemplos de consultas para {tipoReporte === 'productos' ? 'productos' : 'ventas'}
        </Typography>
        <List dense>
          {ejemplosActuales.slice(0, 5).map((ejemplo, index) => (
            <ListItem key={index}>
              <Chip 
                label={`${index + 1}`} 
                color={tipoReporte === 'productos' ? 'info' : 'success'} 
                size="small" 
                sx={{ mr: 2 }} 
              />
              <ListItemText 
                primary={ejemplo} 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Mensaje de Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* ¡CAMBIO! Mensaje de Éxito de la descarga */}
      {success && !loading && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Texto Transcrito */}
      {transcript && !loading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="overline">Consulta detectada:</Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            "{transcript}"
          </Typography>
        </Box>
      )}

      {/* ¡CAMBIO! Eliminamos la sección que mostraba el JSON */}
    </Box>
  );
};