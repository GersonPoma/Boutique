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
  Divider,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import {
  generarReporte
} from '../../api/reportes';
// Importamos el tipo de respuesta de Axios
import type { AxiosResponse } from 'axios';
import { AutoAwesome } from '@mui/icons-material';

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
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

        response = await generarReporte({ text: transcript });
        
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
  }, [transcript]);

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

  // Ejemplos organizados por categoría
  const ejemplosReportes = {
    productos: [
      "Dame un reporte de los productos más vendidos este mes",
      "Quiero un reporte en excel de los 10 productos más vendidos de marca nike este mes",
      "Dame un reporte en pdf de los productos de marca adidas más vendidos del mes pasado",
      "Quiero ver los 5 productos más vendidos en ventas online este año",
      "Dame un reporte de las zapatillas nike más vendidas este mes",
    ],
    ventas: [
      "Quiero un reporte en excel de las ventas a crédito de este mes que aún se estén pagando",
      "Dame un reporte en pdf de las ventas físicas completadas del mes pasado",
      "Quiero un reporte en excel de las ventas online que superen los 500 bs hace 5 meses",
      "Dame un reporte de las ventas a crédito completadas este año que superen los 2000 bolivianos",
      "Dame un reporte en excel de las ventas físicas completadas pagados a crédito del mes pasado",
    ],
  };

return (
    <Box sx={{ p: 3, maxWidth: 900, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        <AutoAwesome sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
        Asistente de Reportes IA
      </Typography>
      
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 2 }}>
        Simplemente dime qué necesitas saber. Yo detectaré si buscas información sobre 
        <b> productos</b> o <b>ventas</b>.
      </Typography>

      {/* Botón de Micrófono */}
      <Box sx={{ textAlign: 'center', my: 5 }}>
        <Button
          variant="contained"
          color={isListening ? 'error' : 'primary'}
          onClick={handleToggleListen}
          disabled={!recognition}
          sx={{ 
            width: 200, 
            height: 200, 
            borderRadius: '50%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)' 
          }}
        >
          {loading ? (
            <CircularProgress size={60} color="inherit" />
          ) : isListening ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <StopIcon sx={{ fontSize: 60 }} />
                <Typography variant="button">Detener</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MicIcon sx={{ fontSize: 80 }} />
                <Typography variant="button" sx={{ mt: 1 }}>Presiona para hablar</Typography>
            </Box>
          )}
        </Button>
      </Box>

      {/* Mensajes de Estado */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && !loading && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Transcripción en tiempo real */}
      {transcript && !loading && (
        <Paper elevation={3} sx={{ p: 2, mb: 4, textAlign: 'center', bgcolor: '#e3f2fd' }}>
          <Typography variant="overline" display="block">Interpretando:</Typography>
          <Typography variant="h6" sx={{ fontStyle: 'italic' }}>"{transcript}"</Typography>
        </Paper>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Ejemplos de uso por categoría */}
      <Box>
        {/* Reportes de Productos */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Ejemplos de Reportes de Productos
          </Typography>
          <List dense>
            {ejemplosReportes.productos.map((ejemplo, index) => (
              <ListItem key={index}>
                <Chip 
                  label={index + 1}
                  size="small" 
                  color="info"
                  sx={{ mr: 2 }} 
                />
                <ListItemText 
                  primary={ejemplo}
                  slotProps={{
                    primary: { 
                      sx: { variant: 'body2', color: 'text.primary' }
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Reportes de Ventas */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            Ejemplos de Reportes de Ventas
          </Typography>
          <List dense>
            {ejemplosReportes.ventas.map((ejemplo, index) => (
              <ListItem key={index}>
                <Chip 
                  label={index + 1}
                  size="small" 
                  color="success"
                  sx={{ mr: 2 }} 
                />
                <ListItemText 
                  primary={ejemplo}
                  slotProps={{
                    primary: { 
                      sx: { variant: 'body2', color: 'text.primary' }
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Predicción (Próximamente) */}
        <Paper sx={{ p: 3, backgroundColor: '#fff3e0', borderRadius: 2, border: '2px dashed #ff9800' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#f57c00' }}>
            Reportes de Predicción (Próximamente)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pronto podrás solicitar predicciones de ventas, demanda de productos y análisis de tendencias con inteligencia artificial.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};