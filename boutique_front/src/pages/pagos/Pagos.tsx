import { ArrowBack, ArrowForward, Block } from "@mui/icons-material";
import { Alert, Box, IconButton, Paper, Snackbar, Table, TableBody, TableCell, TableFooter, TableHead, TableRow, Typography } from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { useEffect, useState } from "react";
import type { PageResponse } from "../../types/pagination";
import { getPagos } from "../../api/pago";
import type { Pago } from "../../types/pago";
import { ModalDetallePago } from "./ModalDetallePago";

export const Pagos = () => {

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [datosPagina, setDatosPagina] = useState<PageResponse<Pago> | null>(null);
  const [pagina, setPagina] = useState(0);

  const [pagoIdSeleccionado, setPagoIdSeleccionado] = useState<number | null>(null);

  const [abrirModalDetallePago, setAbrirModalDetallePago] = useState(false);

  useEffect(() => {
    cargarPagina(0);
  }, []);

  const cargarPagina = async(numPagina: number) => {
    try {
      const data = await getPagos(numPagina);
      setDatosPagina(data);
      setPagina(numPagina);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al cargar los pagos",
        severity: "error"
      });
    }
  };

  const handlePaginaAnterior = () => {
    if (pagina > 0) {
      cargarPagina(pagina - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    if (datosPagina && pagina < datosPagina.totalPages - 1) {
      cargarPagina(pagina + 1);
    }
  };

  const handleAbrirPagoDetalle = (idPago: number | null) => {
    setPagoIdSeleccionado(idPago);
    setAbrirModalDetallePago(true);
  };

  const pagos = datosPagina ? datosPagina.content : [];

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Pagos</Typography>
      </Box>

      {pagos.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 250,
            mt: 3,
            borderRadius: 2,
            color: "text.secondary",
            backgroundColor: "background.default",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ mb: 1 }}>
              <Block sx={{ fontSize: 48, color: "grey.500" }} />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              No hay pagos registrados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cuando se realicen pagos, aparecerán aquí.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Fecha y Hora</TableCell>
              <TableCell align="center">Método de Pago</TableCell>
              <TableCell align="center">Monto</TableCell>
              <TableCell align="center">Pago de</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagos.map((pago) => (
              <TableRow key={pago.id}>
                <TableCell align="center">{pago.id}</TableCell>
                <TableCell align="center">{`${pago.fecha} ${pago.hora}`}</TableCell>
                <TableCell align="center">{pago.metodoPago}</TableCell>
                <TableCell align="center">{pago.monto}</TableCell>
                <TableCell align="center">{pago.pagoDe}</TableCell>
                <TableCell align="center">{pago.estado}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleAbrirPagoDetalle(pago.id)}
                  >
                    <RemoveRedEyeIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Box display="flex" justifyContent="center" alignItems="center" gap={2} my={1}>
                  <IconButton onClick={handlePaginaAnterior} disabled={pagina === 0}>
                    <ArrowBack />
                  </IconButton>
                  <Typography>
                    Página {pagina + 1} de {datosPagina?.totalPages ?? 1}
                  </Typography>
                  <IconButton
                    onClick={handlePaginaSiguiente}
                    disabled={datosPagina ? pagina >= datosPagina.totalPages - 1 : true}
                  >
                    <ArrowForward />
                  </IconButton>                  
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}

      <ModalDetallePago
        open={abrirModalDetallePago}
        onClose={() => setAbrirModalDetallePago(false)}
        idPago={pagoIdSeleccionado!}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>      
    </>
  );
}