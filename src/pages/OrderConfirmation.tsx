import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Download, XCircle, AlertCircle } from 'lucide-react';
import { getOrderById, cancelOrder } from '@/db/api';
import type { OrderWithItems } from '@/types';
import { formatDateTime, canCancelOrder } from '@/lib/date-utils';
import { getOrderStatusLabel } from '@/lib/order-status-utils';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CancelOrderDialog from '@/components/ui/CancelOrderDialog';

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    const orderData = await getOrderById(orderId);
    setOrder(orderData);
    setLoading(false);
  };

  const handleCancelOrder = async () => {
    if (!order) return;

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
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!order) return;

    setCancelDialogOpen(false);
    setCancelling(true);
    
    try {
      const result = await cancelOrder(order.id, user!.id, 'User requested cancellation');
      
      toast({
        title: 'Order cancelled successfully',
        description: `${result.message} Refund amount: ₹${result.refund_amount.toFixed(2)}`,
      });
      navigate('/orders');
    } catch (error) {
      toast({
        title: 'Cancellation failed',
        description: error instanceof Error ? error.message : 'Failed to cancel order',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const getRefundInfo = () => {
    if (!order) return { refundAmount: 0, refundPercentage: 0 };
    
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

  const canCancelThisOrder = (): boolean => {
    if (!order) return false;
    
    // Cannot cancel if already completed or cancelled
    if (['completed', 'cancelled'].includes(order.status)) {
      return false;
    }
    
    // Check time restriction (2 hours before pickup)
    return canCancelOrder(order.pickup_date, order.pickup_time);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Order not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">Your order has been placed successfully</p>
        </div>

        {/* Professional Receipt Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Receipt</CardTitle>
              <Badge variant="outline" className="text-xs">
                #{order.id.slice(0, 8).toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order Date</p>
                <p className="font-medium">{formatDateTime(order.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pickup Time</p>
                <p className="font-medium">{order.pickup_time}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Payment Method</p>
                <p className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                <Badge 
                  variant={
                    order.status === 'completed' ? 'default' :
                    order.status === 'cancelled' ? 'destructive' :
                    order.status === 'ready' ? 'default' :
                    'secondary'
                  }
                  className="font-semibold"
                >
                  {getOrderStatusLabel(order.status)}
                </Badge>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-b pb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.order_items.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.menu_items.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-center py-2 bg-muted/30 px-4 rounded-lg">
              <span className="text-sm font-semibold uppercase tracking-wide">Total Amount</span>
              <span className="text-2xl font-bold text-primary">₹{order.total_amount.toFixed(2)}</span>
            </div>

            {/* Special Instructions */}
            {order.special_instructions && (
              <div className="border-t pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Special Instructions</p>
                <p className="text-sm bg-muted/30 p-3 rounded-md">{order.special_instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card className="mb-6">
          <CardHeader className="relative z-10">
            <CardTitle className="text-center">Pickup QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Show this QR code at the canteen counter to collect your order
            </p>
            {order.qr_code && (
              <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-border">
                <QRCodeDataUrl text={order.qr_code} width={200} />
              </div>
            )}
            <div className="mt-6 text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Token:</span>
                <span className="text-sm font-mono font-bold">{order.payment_token}</span>
              </div>
              <p className="text-xs text-warning flex items-center justify-center gap-2">
                <AlertCircle className="h-3 w-3" />
                This QR code is valid for one-time use only
              </p>
            </div>
          </CardContent>
        </Card>

        {canCancelThisOrder() && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {order?.status === 'preparing' || order?.status === 'ready' 
                ? 'Kitchen has started preparing your order. Cancellation will result in 50% refund.'
                : 'You can cancel this order and receive a full refund up to 2 hours before pickup time.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/orders">View All Orders</Link>
          </Button>
          {canCancelThisOrder() && (
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              <XCircle className="mr-2 h-4 w-4" />
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
          <Button className="flex-1" asChild>
            <Link to="/menu">Order Again</Link>
          </Button>
        </div>

        {/* Cancel Order Dialog */}
        {order && (
          <CancelOrderDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onConfirm={confirmCancelOrder}
            orderStatus={order.status}
            totalAmount={order.total_amount}
            refundAmount={getRefundInfo().refundAmount}
            refundPercentage={getRefundInfo().refundPercentage}
          />
        )}
      </div>
    </MainLayout>
  );
}
