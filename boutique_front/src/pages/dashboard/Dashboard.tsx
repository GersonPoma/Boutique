import { Box, Container, Typography } from '@mui/material';
import { Prediccion } from './Prediccion';
export const Dashboard = () => (
  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido al Dashboard
        </Typography>
    </Box>

    <Prediccion />
  </Container>
);
