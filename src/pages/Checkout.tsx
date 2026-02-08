import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';
import type { CartItem, PaymentMethod, PickupSlot } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder, createOrderItems, getActiveSessions, getPickupSlots, checkSlotAvailability, validateCashOnPickup } from '@/db/api';
import { generatePaymentToken, generateOrderQRData } from '@/lib/token-generator';
import { getCurrentDate, getTimeSlots } from '@/lib/date-utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pickupSlot, setPickupSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, { available: number; max: number; isAvailable: boolean }>>({});
  const [cashOnPickupAllowed, setCashOnPickupAllowed] = useState(true);
  const [cashOnPickupMessage, setCashOnPickupMessage] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadCart();
    loadTimeSlots();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      validateCashOnPickupEligibility();
    }
  }, [cartItems]);

  useEffect(() => {
    if (timeSlots.length > 0) {
      loadSlotAvailability();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('pickup_slots_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pickup_slots',
            filter: `date=eq.${getCurrentDate()}`,
          },
          () => {
            loadSlotAvailability();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [timeSlots]);

  const validateCashOnPickupEligibility = async () => {
    const orderItems = cartItems.map(item => ({
      menu_item_id: item.menuItem.id,
      quantity: item.quantity,
    }));

    const validation = await validateCashOnPickup(orderItems);
    setCashOnPickupAllowed(validation.is_valid);
    setCashOnPickupMessage(validation.message);

    // If cash on pickup is not allowed and currently selected, switch to card
    if (!validation.is_valid && paymentMethod === 'cash_on_pickup') {
      setPaymentMethod('card');
    }
  };

  const loadCart = () => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      setCartItems(JSON.parse(cart));
    } else {
      navigate('/cart');
    }
  };

  const loadTimeSlots = async () => {
    const sessions = await getActiveSessions();
    const allSlots: string[] = [];
    sessions.forEach(session => {
      const slots = getTimeSlots(session.start_time, session.end_time);
      allSlots.push(...slots);
    });
    setTimeSlots(allSlots);
  };

  const loadSlotAvailability = async () => {
    const availability: Record<string, { available: number; max: number; isAvailable: boolean }> = {};
    
    for (const slot of timeSlots) {
      try {
        const slotInfo = await checkSlotAvailability(getCurrentDate(), slot);
        availability[slot] = {
          available: slotInfo.available_slots,
          max: slotInfo.max_capacity,
          isAvailable: slotInfo.is_available
        };
      } catch (error) {
        console.error(`Error checking availability for ${slot}:`, error);
        availability[slot] = { available: 10, max: 10, isAvailable: true };
      }
    }
    
    setSlotAvailability(availability);
  };

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!pickupSlot) {
      setError('Please select a pickup time slot');
      return;
    }

    // Check slot availability before placing order
    const slotInfo = slotAvailability[pickupSlot];
    if (!slotInfo || !slotInfo.isAvailable) {
      setError('Selected pickup slot is fully booked. Please choose another time.');
      toast({
        title: 'Slot Unavailable',
        description: 'The selected pickup slot is fully booked. Please choose another time.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const paymentToken = generatePaymentToken();
      const qrData = generateOrderQRData('temp', paymentToken);
      
      const orderData = {
        user_id: user.id,
        total_amount: getTotalAmount(),
        status: 'pending' as const,
        pickup_date: getCurrentDate(),
        pickup_time: pickupSlot,
        pickup_slot: pickupSlot,
        payment_method: paymentMethod,
        payment_token: paymentToken,
        payment_completed: true,
        qr_code: qrData,
        special_instructions: specialInstructions || null,
      };

      const order = await createOrder(orderData);

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price,
        customizations: item.customizations || null,
      }));

      await createOrderItems(orderItems);

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));

      toast({
        title: 'Order placed successfully!',
        description: 'Your order has been confirmed',
      });

      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pickup Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupSlot">Pickup Time Slot *</Label>
                  <Select value={pickupSlot} onValueChange={setPickupSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(slot => {
                        const availability = slotAvailability[slot];
                        const isFullyBooked = availability && !availability.isAvailable;
                        const availableCount = availability?.available || 0;
                        const maxCount = availability?.max || 10;
                        
                        return (
                          <SelectItem 
                            key={slot} 
                            value={slot}
                            disabled={isFullyBooked}
                          >
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {slot}
                              </span>
                              {availability ? (
                                isFullyBooked ? (
                                  <Badge variant="destructive" className="ml-2">Fully Booked</Badge>
                                ) : availableCount <= 3 ? (
                                  <Badge variant="secondary" className="ml-2">
                                    {availableCount}/{maxCount} left
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="ml-2">
                                    {availableCount}/{maxCount} available
                                  </Badge>
                                )
                              ) : (
                                <Badge variant="outline" className="ml-2">Loading...</Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Orders for today only. Pickup date: {getCurrentDate()}
                  </p>
                  {pickupSlot && slotAvailability[pickupSlot] && (
                    <div className="flex items-center gap-2 text-sm">
                      {slotAvailability[pickupSlot].isAvailable ? (
                        <Badge variant="default" className="bg-green-600">
                          ✓ Available ({slotAvailability[pickupSlot].available} slots left)
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          ✗ Fully Booked
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Any special requests or dietary requirements..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      Credit/Debit Card (Simulated)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                      Digital Wallet (Simulated)
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 border rounded-lg ${!cashOnPickupAllowed ? 'opacity-50 bg-muted' : ''}`}>
                    <RadioGroupItem value="cash_on_pickup" id="cash" disabled={!cashOnPickupAllowed} />
                    <Label htmlFor="cash" className={`flex-1 ${cashOnPickupAllowed ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      Cash on Pickup
                      {!cashOnPickupAllowed && (
                        <span className="block text-xs text-muted-foreground mt-1">
                          Only available for snack items (max 2)
                        </span>
                      )}
                    </Label>
                  </div>
                </RadioGroup>
                
                {!cashOnPickupAllowed && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {cashOnPickupMessage}
                    </AlertDescription>
                  </Alert>
                )}
                
                <p className="text-xs text-muted-foreground mt-4">
                  Payment is simulated for demonstration purposes
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div key={item.menuItem.id} className="flex justify-between text-sm">
                      <span>{item.menuItem.name} × {item.quantity}</span>
                      <span>₹{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{getTotalAmount().toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={loading || !pickupSlot}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
