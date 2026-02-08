import type { ReactNode } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import MenuManagement from './pages/admin/MenuManagement';
import OrderManagement from './pages/admin/OrderManagement';
import OrderPickup from './pages/admin/OrderPickup';
import InventoryManagement from './pages/admin/InventoryManagement';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import SlotManagement from './pages/admin/SlotManagement';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />,
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
  },
  {
    name: 'Register',
    path: '/register',
    element: <Register />,
  },
  {
    name: 'Menu',
    path: '/menu',
    element: <Menu />,
  },
  {
    name: 'Cart',
    path: '/cart',
    element: <Cart />,
  },
  {
    name: 'Checkout',
    path: '/checkout',
    element: <Checkout />,
  },
  {
    name: 'Order Confirmation',
    path: '/order-confirmation/:orderId',
    element: <OrderConfirmation />,
  },
  {
    name: 'Order History',
    path: '/orders',
    element: <OrderHistory />,
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <Profile />,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    name: 'Menu Management',
    path: '/admin/menu',
    element: <MenuManagement />,
  },
  {
    name: 'Order Management',
    path: '/admin/orders',
    element: <OrderManagement />,
  },
  {
    name: 'Order Pickup',
    path: '/admin/pickup',
    element: <OrderPickup />,
  },
  {
    name: 'Inventory Management',
    path: '/admin/inventory',
    element: <InventoryManagement />,
  },
  {
    name: 'User Management',
    path: '/admin/users',
    element: <UserManagement />,
  },
  {
    name: 'Analytics',
    path: '/admin/analytics',
    element: <Analytics />,
  },
  {
    name: 'Slot Management',
    path: '/admin/slots',
    element: <SlotManagement />,
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    element: <Settings />,
  },
];

export default routes;
