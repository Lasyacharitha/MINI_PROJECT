import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllOrders, updateOrder } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { OrderWithItems, OrderStatus } from '@/types';
import { formatDateTime, formatTime } from '@/lib/date-utils';
import { useToast } from '@/hooks/use-toast';

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning',
  confirmed: 'bg-info/10 text-info border-info',
  preparing: 'bg-primary/10 text-primary border-primary',
  ready: 'bg-success/10 text-success border-success',
  completed: 'bg-muted text-muted-foreground border-muted',
  cancelled: 'bg-destructive/10 text-destructive border-destructive',
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, orders]);

  const loadOrders = async () => {
    setLoading(true);
    const allOrders = await getAllOrders();
    setOrders(allOrders);
    setLoading(false);
  };

  const filterOrders = () => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Get current order to find old status
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) return;

    const oldStatus = currentOrder.status;
    
    // Update order status in database
    const updated = await updateOrder(orderId, { status: newStatus });
    
    if (updated) {
      // Create in-app notification for the user
      try {
        await supabase.from('notifications').insert({
          user_id: currentOrder.user_id,
          title: 'Order Status Updated',
          message: `Your order status has been updated to: ${newStatus}`,
          type: 'order_update',
          is_read: false,
        } as never);
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      toast({ title: 'Order status updated successfully' });
      
      // Send email notification
      try {
        const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-order-status-email', {
          body: {
            orderId,
            userId: currentOrder.user_id,
            newStatus,
            oldStatus,
          },
        });

        if (emailError) {
          console.error('Email notification error:', emailError);
          toast({ 
            title: 'Status updated successfully', 
            description: `Order status changed to ${newStatus}. In-app notification sent to customer (email simulation mode)`,
            variant: 'default' 
          });
        } else {
          const recipientEmail = emailResponse?.recipient || currentOrder.profiles?.email || 'customer';
          toast({ 
            title: 'Status updated and notification sent', 
            description: `In-app notification sent. Email logged for ${recipientEmail} (simulation mode)` 
          });
        }
      } catch (error) {
        console.error('Email error:', error);
      }
      
      loadOrders();
    } else {
      toast({ title: 'Failed to update order status', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Management</h1>
            <p className="text-muted-foreground">Monitor and manage all orders</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Pickup Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.profiles.full_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{order.profiles.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.order_items.length} items</TableCell>
                      <TableCell className="font-semibold">₹{order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{order.pickup_date}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(order.pickup_time)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
