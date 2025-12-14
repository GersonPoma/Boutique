import { useState, Fragment, type JSX } from 'react';
import { Drawer, List, IconButton, Toolbar, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { SidebarItem } from './SidebarItem';
import { useAuth } from '../../context/AuthContext';
import { Rol } from '../../types/usuario';
import { InventoryRounded, PointOfSaleSharp, Report } from '@mui/icons-material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

type MenuItem = {
  label: string;
  to: string;
  icon: JSX.Element;
  roles: string[];
};

const MENU: MenuItem[] = [
  { label: 'Dashboard', to: '/dashboard',      icon: <DashboardIcon />, roles: [Rol.ADMIN, Rol.GERENTE, Rol.VENDEDOR] },
  { label: 'Usuarios',  to: '/dashboard/usuarios', icon: <PeopleIcon />,    roles: [Rol.ADMIN] },
  { label: 'Inventario', to: '/dashboard/inventario', icon: <InventoryRounded />, roles: [
    Rol.ADMIN, Rol.GERENTE, Rol.VENDEDOR, Rol.INVENTARISTA
  ] },
  { label: 'Ventas', to: '/dashboard/venta', icon: <PointOfSaleSharp />, roles: [
    Rol.ADMIN, Rol.GERENTE, Rol.VENDEDOR
  ] },
  { label: 'Pagos', to: '/dashboard/pago', icon: <AccountBalanceWalletIcon />, roles: [
    Rol.ADMIN, Rol.GERENTE, Rol.VENDEDOR
  ] },
  { label: 'Reportes', to: '/dashboard/reportes', icon: <Report />, roles: [
    Rol.ADMIN, Rol.GERENTE, Rol.VENDEDOR
  ] },
  { label: 'Catálogo', to: '/catalogo', icon: <StorefrontIcon />, roles: [Rol.CLIENTE] },
  { label: 'Mis Compras', to: '/mis-compras', icon: <ShoppingBagIcon />, roles: [Rol.CLIENTE] },
];

export function Sidebar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(true);
  const toggleDrawer = () => setOpen(o => !o);

  return (
    <Fragment>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? 220 : 64,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? 220 : 64,
            transition: 'width 0.3s',
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar>
          <IconButton onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List sx={{ pt: 0 }}>
          {MENU.filter(it => user && it.roles.includes(user.rol)).map(it => (
            <SidebarItem
              key={it.to}
              to={it.to}
              label={it.label}
              icon={it.icon}
              open={open}
            />
          ))}
        </List>
      </Drawer>
    </Fragment>
  );
}
