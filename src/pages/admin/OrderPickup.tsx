import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Search, CheckCircle, XCircle, Package, User, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/db/supabase';
import type { OrderWithItems } from '@/types';
import { formatTime } from '@/lib/date-utils';
import { useToast } from '@/hooks/use-toast';

export default function OrderPickup() {
  const [token, setToken] = useState('');
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const searchOrder = async () => {
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // Search for order by payment token or QR code
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*)), profiles(*)')
        .or(`payment_token.eq.${token},qr_code.eq.${token}`)
        .maybeSingle();

      if (fetchError) {
        setError('Error searching for order');
        console.error(fetchError);
      } else if (!data) {
        setError('Order not found. Please check the token and try again.');
      } else {
        const orderData = data as unknown as OrderWithItems;
        if (orderData.status === 'completed') {
          setError('This order has already been picked up.');
          setOrder(orderData);
        } else if (orderData.status === 'cancelled') {
          setError('This order has been cancelled.');
          setOrder(orderData);
        } else {
          setOrder(orderData);
        }
      }
    } catch (err) {
      setError('An error occurred while searching for the order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async () => {
    if (!order) return;

    setCompleting(true);
    try {
      const oldStatus = order.status;
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed' as const,
          updated_at: new Date().toISOString()
        } as never)
        .eq('id', order.id);

      if (updateError) {
        toast({
          title: 'Error',
          description: 'Failed to complete order',
          variant: 'destructive',
        });
      } else {
        // Create notification for user
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          title: 'Order Completed',
          message: 'Your order has been picked up successfully. Thank you!',
          type: 'order_update' as const,
          is_read: false,
        } as never);

        // Send email notification
        try {
          const { error: emailError } = await supabase.functions.invoke('send-order-status-email', {
            body: {
              orderId: order.id,
              userId: order.user_id,
              newStatus: 'completed',
              oldStatus,
            },
          });

          if (emailError) {
            console.error('Email notification error:', emailError);
          }
        } catch (error) {
          console.error('Email error:', error);
        }

        toast({
          title: 'Order completed',
          description: 'Order marked as picked up successfully',
        });

        // Reset form
        setOrder(null);
        setToken('');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setCompleting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchOrder();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Pickup</h1>
          <p className="text-muted-foreground">Scan QR code or enter token to verify and complete orders</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan or Enter Token
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter payment token or scan QR code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                autoFocus
              />
              <Button onClick={searchOrder} disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {order && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Details</CardTitle>
                <Badge 
                  variant={order.status === 'completed' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'outline'}
                  className="capitalize"
                >
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{order.profiles?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Time</p>
                    <p className="font-medium">{formatTime(order.pickup_time)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Order Items</h3>
                </div>
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.menu_items.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                        {item.customizations && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Customizations: {typeof item.customizations === 'string' ? item.customizations : JSON.stringify(item.customizations)}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Total Amount */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">₹{order.total_amount.toFixed(2)}</span>
              </div>

              {/* Special Instructions */}
              {order.special_instructions && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Special Instructions</p>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {order.special_instructions}
                    </p>
                  </div>
                </>
              )}

              {/* Payment Information */}
              <Separator />
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <>
                  <Separator />
                  <div className="flex gap-3">
                    <Button 
                      onClick={completeOrder} 
                      disabled={completing}
                      className="flex-1"
                      size="lg"
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      {completing ? 'Completing...' : 'Mark as Picked Up'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setOrder(null);
                        setToken('');
                        setError('');
                      }}
                      size="lg"
                    >
                      <XCircle className="mr-2 h-5 w-5" />
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {order.status === 'completed' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    This order has already been picked up.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Ask the customer to show their QR code</p>
            <p>2. Scan the QR code or manually enter the token displayed below it</p>
            <p>3. Verify the order details match what the customer ordered</p>
            <p>4. Prepare and hand over the order items</p>
            <p>5. Click "Mark as Picked Up" to complete the transaction</p>
            <p className="text-warning font-medium mt-4">⚠️ Each QR code can only be used once</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
