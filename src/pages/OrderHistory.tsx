import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, Package, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, cancelOrder } from '@/db/api';
import type { OrderWithItems } from '@/types';
import { formatDateTime, canCancelOrder } from '@/lib/date-utils';
import { getOrderStatusLabel } from '@/lib/order-status-utils';
import { useToast } from '@/hooks/use-toast';
import CancelOrderDialog from '@/components/ui/CancelOrderDialog';

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning',
  confirmed: 'bg-info/10 text-info border-info',
  preparing: 'bg-primary/10 text-primary border-primary',
  ready: 'bg-success/10 text-success border-success',
  completed: 'bg-muted text-muted-foreground border-muted',
  cancelled: 'bg-destructive/10 text-destructive border-destructive',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderWithItems | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    const userOrders = await getUserOrders(user.id);
    setOrders(userOrders);
    setLoading(false);
  };

  const handleCancelOrder = async (order: OrderWithItems) => {
    // Check if cancellation is allowed based on time
    const canCancel = canCancelOrder(order.pickup_date, order.pickup_time);
    
    if (!canCancel) {
      toast({
        title: 'Cannot cancel order',
        description: 'Orders can only be cancelled up to 2 hours before pickup time',
        variant: 'destructive',
      });
      return;
    }

    // Check if order status allows cancellation
    if (['completed', 'cancelled'].includes(order.status)) {
      toast({
        title: 'Cannot cancel order',
        description: 'This order cannot be cancelled',
        variant: 'destructive',
      });
      return;
    }

    // Open cancel dialog
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    setCancelDialogOpen(false);
    setCancellingOrderId(orderToCancel.id);
    
    try {
      const result = await cancelOrder(orderToCancel.id, user!.id, 'User requested cancellation');
      
      toast({
        title: 'Order cancelled successfully',
        description: `${result.message} Refund amount: ₹${result.refund_amount.toFixed(2)}`,
      });
      loadOrders(); // Reload orders
    } catch (error) {
      toast({
        title: 'Cancellation failed',
        description: error instanceof Error ? error.message : 'Failed to cancel order',
        variant: 'destructive',
      });
    } finally {
      setCancellingOrderId(null);
      setOrderToCancel(null);
    }
  };

  const getRefundInfo = (order: OrderWithItems) => {
    let refundPercentage = 0;
    
    if (order.status === 'pending' || order.status === 'confirmed') {
      refundPercentage = 100;
    } else if (order.status === 'preparing') {
      refundPercentage = 50;
    } else if (order.status === 'ready') {
      refundPercentage = 0;
    }
    
    const refundAmount = (order.total_amount * refundPercentage) / 100;
    
    return { refundAmount, refundPercentage };
  };

  const canCancelThisOrder = (order: OrderWithItems): boolean => {
    // Cannot cancel if already completed or cancelled
    if (['completed', 'cancelled'].includes(order.status)) {
      return false;
    }
    
    // Can cancel pending, confirmed, preparing, and ready orders
    // (but ready orders get 0% refund)
    // Check time restriction (2 hours before pickup)
    return canCancelOrder(order.pickup_date, order.pickup_time);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Order History</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-1/4 mb-4 bg-muted" />
                  <Skeleton className="h-4 w-full mb-2 bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Start ordering delicious meals from our menu</p>
              <Button asChild>
                <Link to="/menu">Browse Menu</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                        <Badge 
                          className={statusColors[order.status]}
                          variant="outline"
                        >
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatDateTime(order.created_at)}
                      </p>
                      <p className="text-sm mb-2">
                        {order.order_items.length} item(s) • Pickup: {order.pickup_time}
                      </p>
                      <p className="font-bold text-xl text-primary">₹{order.total_amount.toFixed(2)}</p>
                      {order.status === 'cancelled' && order.refund_amount !== null && (
                        <p className="text-sm text-success mt-1 font-medium">
                          Refund: ₹{order.refund_amount.toFixed(2)} ({order.refund_status || 'pending'})
                        </p>
                      )}
                      {order.cancellation_reason && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Reason: {order.cancellation_reason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild>
                        <Link to={`/order-confirmation/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                      {canCancelThisOrder(order) && (
                        <Button 
                          variant="destructive" 
                          onClick={() => handleCancelOrder(order)}
                          disabled={cancellingOrderId === order.id}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </Button>
                      )}
                      {order.status === 'preparing' && canCancelThisOrder(order) && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            50% refund if cancelled now
                          </AlertDescription>
                        </Alert>
                      )}
                      {order.status === 'ready' && canCancelThisOrder(order) && (
                        <Alert className="mt-2" variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            No refund available - order is ready
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cancel Order Dialog */}
        {orderToCancel && (
          <CancelOrderDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onConfirm={confirmCancelOrder}
            orderStatus={orderToCancel.status}
            totalAmount={orderToCancel.total_amount}
            refundAmount={getRefundInfo(orderToCancel).refundAmount}
            refundPercentage={getRefundInfo(orderToCancel).refundPercentage}
          />
        )}
      </div>
    </MainLayout>
  );
}
