import { useState } from "react";
import { deleteVenta } from "../../api/ventas";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirmado: () => void;
  idVenta: number | null;
}

export const ModalCancelar = ({ open, onClose, onConfirmado, idVenta }: Props) => {
    const [procesando, setProcesando] = useState(false);

    const handleConfirmar = async () => {
        if (!idVenta) return;
        setProcesando(true);
        try {
        await deleteVenta(idVenta);
        onConfirmado();
        onClose();
        } catch (e) {
            console.error('Error al eliminar venta:', e);
        } finally {
        setProcesando(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Cancelar venta</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    ¿Estás seguro que deseas cancelar la venta #<strong>{idVenta}</strong>?
                </DialogContentText>
            </DialogContent>
        <DialogActions>
            <Button onClick={onClose} disabled={procesando}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={handleConfirmar} disabled={procesando}>
            Confirmar
            </Button>
        </DialogActions>
        </Dialog>
    );
};