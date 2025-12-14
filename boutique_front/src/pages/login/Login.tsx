import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Rol } from '../../types/usuario';

export const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedUser = await login(username, password);
      
      // Redirigir según el rol
      if (loggedUser.rol === Rol.CLIENTE) {
        navigate('/catalogo');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Iniciar Sesión</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nombre de usuario"
            fullWidth
            margin="normal"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <TextField
            label="Contraseña"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Entrar
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ¿No tienes una cuenta?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/registro')}
                sx={{ textTransform: 'none' }}
              >
                Regístrate aquí
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
