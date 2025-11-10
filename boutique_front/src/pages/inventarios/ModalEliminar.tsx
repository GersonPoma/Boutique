import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import type { Inventario } from '../../types/inventario';
import { deleteInventario } from '../../api/inventario';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirmado: () => void;
  inventario: Inventario | null;
}

export const ModalEliminar = ({ open, onClose, onConfirmado, inventario }: Props) => {
  const [procesando, setProcesando] = useState(false);

  const handleConfirmar = async () => {
    if (!inventario) return;
    setProcesando(true);
    try {
      await deleteInventario(inventario.id!);
      onConfirmado();
      onClose();
    } catch (e) {
      console.error('Error al eliminar inventario:', e);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Eliminar inventario</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro que deseas eliminar al inventario <strong>{inventario?.id}</strong>?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={procesando}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={handleConfirmar} disabled={procesando}>
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
