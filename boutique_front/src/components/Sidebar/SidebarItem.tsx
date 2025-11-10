import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { NavLink } from 'react-router-dom';
import type { ReactElement } from 'react';

export interface SidebarItemProps {
  to: string;
  label: string;
  icon: ReactElement;
  open: boolean;     // si el sidebar está expandido o colapsado
}

export function SidebarItem({ to, label, icon, open }: SidebarItemProps) {
  // Usamos NavLink para poder estilizar según esté activo
  return (
    <Tooltip title={!open ? label : ''} placement="right">
      <ListItemButton
        component={NavLink}
        to={to}
        // `NavLink` agrega la clase 'active' por defecto cuando coincide la ruta
        sx={{
          '&.active': {
            bgcolor: 'action.selected',
            '& .MuiListItemIcon-root': { color: 'primary.main' },
            '& .MuiListItemText-primary': { fontWeight: 600, color: 'primary.main' },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={label}
          sx={{ opacity: open ? 1 : 0, transition: 'opacity 0.2s' }}
        />
      </ListItemButton>
    </Tooltip>
  );
}
