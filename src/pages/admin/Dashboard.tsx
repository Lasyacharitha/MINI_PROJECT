import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { getDashboardStats, getTodayOrders } from '@/db/api';
import type { DashboardStats, OrderWithItems } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/date-utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayOrders, setTodayOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const [statsData, ordersData] = await Promise.all([
      getDashboardStats(),
      getTodayOrders(),
    ]);
    setStats(statsData);
    setTodayOrders(ordersData);
    setLoading(false);
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? `₹${stats.totalRevenue.toFixed(2)}` : '₹0',
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: "Today's Revenue",
      value: stats ? `₹${stats.todayRevenue.toFixed(2)}` : '₹0',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: "Today's Orders",
      value: stats?.todayOrders || 0,
      icon: Package,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Package,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  const statusColors = {
    pending: 'bg-warning/10 text-warning border-warning',
    confirmed: 'bg-info/10 text-info border-info',
    preparing: 'bg-primary/10 text-primary border-primary',
    ready: 'bg-success/10 text-success border-success',
    completed: 'bg-muted text-muted-foreground border-muted',
    cancelled: 'bg-destructive/10 text-destructive border-destructive',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of canteen operations</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Today's Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-muted" />
                ))}
              </div>
            ) : todayOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders today</p>
            ) : (
              <div className="space-y-4">
                {todayOrders.slice(0, 10).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium">#{order.id.slice(0, 8)}</span>
                        <Badge className={statusColors[order.status]}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.profiles.full_name || order.profiles.email} • {order.order_items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">₹{order.total_amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(order.pickup_time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
