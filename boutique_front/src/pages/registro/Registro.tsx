import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import { registrarClienteConUsuario } from '../../api/cliente';

export const Registro = () => {
  const navigate = useNavigate();
  
  const [ci, setCi] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!ci || !nombre || !apellido || !fechaNacimiento) {
      setError('Por favor complete los campos obligatorios (CI, Nombre, Apellido, Fecha de Nacimiento)');
      return;
    }

    if (!username || !password) {
      setError('Por favor ingrese un nombre de usuario y contraseña');
      return;
    }

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const fechaFormateada = fechaNacimiento.toISOString().split('T')[0];
      
      await registrarClienteConUsuario({
        ci,
        nombre,
        apellido,
        fechaNacimiento: fechaFormateada,
        telefono: telefono || undefined,
        correo: correo || undefined,
        direccion: direccion || undefined,
        username,
        password
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el usuario');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" mb={3} textAlign="center">
          Registro de Cliente
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Registro exitoso! Redirigiendo al inicio de sesión...
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Información Personal *
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="CI"
                fullWidth
                required
                value={ci}
                onChange={e => setCi(e.target.value)}
                helperText="Campo obligatorio"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de Nacimiento *"
                  value={fechaNacimiento}
                  onChange={(newValue: Date | null) => setFechaNacimiento(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: 'Campo obligatorio'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nombre"
                fullWidth
                required
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                helperText="Campo obligatorio"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Apellido"
                fullWidth
                required
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                helperText="Campo obligatorio"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Información de Contacto (Opcional)
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Teléfono"
                fullWidth
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Correo Electrónico"
                fullWidth
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Dirección"
                fullWidth
                multiline
                rows={2}
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Credenciales de Acceso *
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nombre de Usuario"
                fullWidth
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                helperText="Campo obligatorio"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Contraseña"
                fullWidth
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                helperText="Mínimo 6 caracteres"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Confirmar Contraseña"
                fullWidth
                required
                type="password"
                value={confirmarPassword}
                onChange={e => setConfirmarPassword(e.target.value)}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
            >
              Registrarse
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
