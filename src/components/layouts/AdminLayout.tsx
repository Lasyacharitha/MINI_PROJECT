import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  Users,
  Settings,
  BarChart3,
  ArrowLeft,
  QrCode,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: UtensilsCrossed, label: 'Menu Management', href: '/admin/menu' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: QrCode, label: 'Order Pickup', href: '/admin/pickup' },
  { icon: Clock, label: 'Pickup Slots', href: '/admin/slots' },
  { icon: Package, label: 'Inventory', href: '/admin/inventory' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:block w-64 border-r bg-sidebar">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">Admin Panel</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="space-y-1 p-4">
            <Button variant="ghost" asChild className="w-full justify-start mb-4">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Link>
            </Button>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  asChild
                  className={cn('w-full justify-start', isActive && 'bg-sidebar-accent')}
                >
                  <Link to={item.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center px-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">Admin Panel</span>
          </Link>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
