import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import type { Usuario } from '../../types/usuario';
import { deleteUsuario } from '../../api/usuarios';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirmado: () => void;
  user: Usuario | null;
}

export const ModalDesactivar = ({ open, onClose, onConfirmado, user }: Props) => {
  const [procesando, setProcesando] = useState(false);

  const handleConfirmar = async () => {
    if (!user) return;
    setProcesando(true);
    try {
      await deleteUsuario(user.id.toString());
      onConfirmado();
      onClose();
    } catch (e) {
      console.error('Error al desactivar usuario:', e);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Desactivar usuario</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro que deseas desactivar al usuario <strong>{user?.username}</strong>?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={procesando}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={handleConfirmar} disabled={procesando}>
          Desactivar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
