# Order Cancellation Policy & Implementation

## Overview
The SRIT Canteen app implements a comprehensive order cancellation system with time-based restrictions and refund policies to balance customer flexibility with kitchen operational needs.

## Cancellation Rules

### Time Restrictions
- **Allowed**: Orders can be cancelled up to **2 hours before pickup time**
- **Blocked**: Cancellations are not allowed within 2 hours of pickup time
- **Reason**: Gives kitchen sufficient time to adjust preparation schedules

### Status-Based Restrictions
Orders can be cancelled based on their current status:

| Order Status | Can Cancel? | Refund Amount |
|--------------|-------------|---------------|
| Pending      | ✅ Yes      | 100% (Full)   |
| Confirmed    | ✅ Yes      | 100% (Full)   |
| Preparing    | ⚠️ Yes*     | 50% (Partial) |
| Ready        | ⚠️ Yes*     | 50% (Partial) |
| Completed    | ❌ No       | N/A           |
| Cancelled    | ❌ No       | N/A           |

*Requires explicit confirmation from user about 50% refund

## Refund Policy

### Full Refund (100%)
- Order cancelled before kitchen starts preparation
- Order status: `pending` or `confirmed`
- User receives complete refund of order amount

### Partial Refund (50%)
- Order cancelled after kitchen starts preparation
- Order status: `preparing` or `ready`
- User receives 50% of order amount
- System shows warning before cancellation

### No Refund
- Order already completed or picked up
- Order already cancelled
- Cancellation attempted within 2 hours of pickup

## User Experience

### Cancellation Flow
1. User views order in Order History or Order Confirmation page
2. System checks if order can be cancelled:
   - Time check: More than 2 hours before pickup?
   - Status check: Not completed or already cancelled?
3. If eligible, "Cancel Order" button is displayed
4. User clicks cancel button
5. System shows confirmation dialog:
   - Full refund: "You will receive a full refund"
   - Partial refund: "You will receive only 50% refund"
6. User confirms cancellation
7. Order status updated to `cancelled`
8. Notification sent to user with refund details

### Visual Indicators
- **Cancel Button**: Red destructive button with XCircle icon
- **Warning Alert**: Shows refund percentage for orders in preparation
- **Time Warning**: Toast notification if cancellation attempted too late
- **Status Badge**: Order status updated to "Cancelled" with red color

## Notifications

### User Notifications
When an order is cancelled, users receive:
- **In-app notification**: "Order Cancelled" with refund details
- **Toast message**: Success confirmation with refund amount
- **Email notification**: (Simulated) Order cancellation confirmation

### Admin Notifications
Admins can see:
- Cancelled orders in Order Management dashboard
- Refund amounts in payment tracking
- Cancellation reasons and timestamps in admin logs

## Technical Implementation

### API Function
```typescript
cancelOrder(orderId: string): Promise<{
  success: boolean;
  refundAmount?: number;
  message?: string;
}>
```

### Time Calculation
```typescript
canCancelOrder(pickupDate: string, pickupTime: string, hoursBeforePickup = 2): boolean
```

### Refund Logic
- Checks order status
- Calculates refund percentage
- Updates order status to 'cancelled'
- Creates notification record
- Returns refund details

## Benefits

### For Customers
- **Flexibility**: Can change plans if needed
- **Fair Policy**: Clear refund rules based on preparation status
- **Easy Process**: Simple one-click cancellation
- **Transparency**: Clear warnings about refund amounts

### For Canteen
- **Reduced Waste**: 2-hour notice allows inventory adjustment
- **Fair Compensation**: 50% retention for prepared orders
- **Operational Efficiency**: Time to reassign resources
- **Customer Trust**: Clear and fair policies

## Edge Cases Handled

1. **Multiple Cancellation Attempts**: Disabled button during processing
2. **Expired Time Window**: Clear error message shown
3. **Already Cancelled**: Button hidden for cancelled orders
4. **Network Errors**: Error handling with retry option
5. **Status Changes**: Real-time status checks before cancellation

## Future Enhancements

Potential improvements:
- Automatic cancellation reminders (1 hour before cutoff)
- Cancellation reasons collection
- Partial order cancellation (specific items)
- Loyalty points for non-cancelled orders
- Peak hour cancellation restrictions
