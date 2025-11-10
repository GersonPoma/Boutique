import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem
} from '@mui/material';
import type { Usuario, CrearUsuario } from '../../types/usuario';
import { Rol } from '../../types/usuario';
import { createUsuario, updateUsuario } from '../../api/usuarios';

interface Props {
  open: boolean;
  onClose: () => void;
  onGuardado: () => void;
  user: Usuario | null;
}

export const ModalFormCrearEditar = ({ open, onClose, onGuardado, user }: Props) => {
  const esEdicion = Boolean(user);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState<{ username: string; password?: string; rol: Rol | '' }>({
    username: '',
    password: '',
    rol: '',
  });

  useEffect(() => {
    if (esEdicion && user) {
      setForm({ username: user.username, rol: user.rol });
    } else {
      setForm({ username: '', password: '', rol: '' });
    }
  }, [esEdicion, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      if (esEdicion && user) {
        await updateUsuario(user.id, {
          username: form.username,
          rol: form.rol as Rol,
        });
      } else {
        const payload: CrearUsuario = {
          username: form.username,
          password: form.password || '',
          rol: form.rol as Rol,
        };
        await createUsuario(payload);
      }
      onGuardado();
      onClose();
    } catch (err) {
      console.error('Error guardando usuario', err);
    } finally {
      setGuardando(false);
    }
  };

  const puedeGuardar = esEdicion
    ? form.username.trim() !== '' && form.rol !== ''
    : form.username.trim() !== '' && (form.password?.trim() ?? '') !== '' && form.rol !== '';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{esEdicion ? 'Editar usuario' : 'Crear usuario'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        {!esEdicion && (
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        )}
        <TextField
          label="Rol"
          name="rol"
          select
          value={form.rol}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          {Object.values(Rol).map(r => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button variant="contained" onClick={handleGuardar} disabled={!puedeGuardar || guardando}>
          {esEdicion ? 'Guardar cambios' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
