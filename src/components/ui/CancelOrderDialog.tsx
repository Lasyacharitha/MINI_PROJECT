import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  orderStatus: string;
  totalAmount: number;
  refundAmount: number;
  refundPercentage: number;
}

export default function CancelOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  orderStatus,
  totalAmount,
  refundAmount,
  refundPercentage,
}: CancelOrderDialogProps) {
  // Determine refund scenario
  const isReadyForPickup = orderStatus === 'ready';
  const isPreparationStarted = orderStatus === 'preparing';
  const isNotStarted = orderStatus === 'pending' || orderStatus === 'confirmed';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isReadyForPickup ? (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Ready for Pickup - No Refund
              </>
            ) : isPreparationStarted ? (
              <>
                <AlertTriangle className="h-5 w-5 text-warning" />
                Preparation Started - Partial Refund
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-success" />
                Cancel Order
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            {isReadyForPickup ? (
              <>
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                  <p className="text-sm font-medium text-foreground mb-2">
                    ❌ No Refund Available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your order is already prepared and ready for pickup. Unfortunately, no refund can be issued at this stage as the food has been fully prepared.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Amount:</span>
                    <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Refund Amount:</span>
                    <span className="font-semibold text-destructive">₹0.00 (0%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Retained:</span>
                    <span className="font-medium text-destructive">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  The order has been fully prepared and is waiting for you. Please pick it up at the scheduled time or contact the canteen staff if you have concerns.
                </p>
              </>
            ) : isPreparationStarted ? (
              <>
                <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
                  <p className="text-sm font-medium text-foreground mb-2">
                    ⚠️ Warning: Partial Refund Only
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The kitchen has already started preparing your order. Due to preparation costs and to prevent food wastage, only a partial refund can be issued.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Amount:</span>
                    <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Refund Amount:</span>
                    <span className="font-semibold text-warning">₹{refundAmount.toFixed(2)} ({refundPercentage}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retained Amount:</span>
                    <span className="font-medium text-destructive">₹{(totalAmount - refundAmount).toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  The retained amount covers preparation costs and food wastage. This helps us maintain quality service and reduce waste.
                </p>
              </>
            ) : (
              <>
                <div className="rounded-lg bg-success/10 border border-success/20 p-4">
                  <p className="text-sm font-medium text-foreground mb-2">
                    ✓ Order Not Yet Started Preparing
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your order hasn't been started yet. You will receive a full refund.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Amount:</span>
                    <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Refund Amount:</span>
                    <span className="font-semibold text-success">₹{refundAmount.toFixed(2)} ({refundPercentage}%)</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  The full amount will be refunded to your original payment method within 3-5 business days.
                </p>
              </>
            )}

            <p className="text-sm font-medium text-foreground">
              Are you sure you want to cancel this order?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              isReadyForPickup 
                ? 'bg-destructive hover:bg-destructive/90' 
                : isPreparationStarted 
                ? 'bg-warning hover:bg-warning/90' 
                : 'bg-destructive hover:bg-destructive/90'
            }
          >
            Yes, Cancel Order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
