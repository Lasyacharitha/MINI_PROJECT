# Order Cancellation and Cash-on-Pickup Restrictions

## Overview
Implemented two critical business rules for the SRIT Canteen Pre-order system:
1. **Order Cancellation with Refund Policy**: Users can cancel orders with automatic refund calculation based on preparation status
2. **Cash-on-Pickup Restrictions**: Limited cash-on-pickup payment to snack items only (maximum 2 items)

## Requirement 1: Order Cancellation and Refund Policy

### Business Rules
- **Full Refund (100%)**: If order hasn't started preparing (status = 'pending')
- **Partial Refund (50%)**: If order has started preparing (status = 'preparing')
- **No Refund**: For orders that are ready or completed
- **Time Restriction**: Orders can only be cancelled at least 1 hour before pickup time

### Database Implementation

#### New Fields in `orders` Table
```sql
ALTER TABLE orders ADD COLUMN refund_status TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMPTZ DEFAULT NULL;
```

**Fields**:
- `refund_status`: Tracks refund processing ('pending', 'processed', 'not_applicable')
- `cancelled_at`: Timestamp when order was cancelled

#### Function: `calculate_refund_amount(order_id)`
Calculates refund amount based on order status.

**Logic**:
- `pending` → 100% refund
- `preparing` → 50% refund
- `ready`, `completed`, `cancelled` → 0% refund

**Returns**: NUMERIC (refund amount)

#### Function: `cancel_order(order_id, user_id, cancellation_reason)`
Cancels an order with automatic refund calculation and validation.

**Validations**:
1. Order exists and belongs to user
2. Order is not already cancelled or completed
3. At least 1 hour before pickup time

**Process**:
1. Validates order ownership
2. Checks order status
3. Validates time restriction
4. Calculates refund amount
5. Updates order status to 'cancelled'
6. Sets refund_amount and refund_status
7. Records cancelled_at timestamp

**Returns**:
```sql
TABLE(
  success BOOLEAN,
  message TEXT,
  refund_amount NUMERIC
)
```

**Example Usage**:
```sql
SELECT * FROM cancel_order(
  'order-uuid-here',
  'user-uuid-here',
  'User requested cancellation'
);
```

### Backend API

#### `cancelOrder(orderId, userId, cancellationReason?)`
```typescript
export const cancelOrder = async (
  orderId: string,
  userId: string,
  cancellationReason?: string
): Promise<{ success: boolean; message: string; refund_amount: number }>
```

**Parameters**:
- `orderId`: UUID of the order to cancel
- `userId`: UUID of the user cancelling the order
- `cancellationReason`: Optional reason for cancellation

**Returns**:
- `success`: Whether cancellation was successful
- `message`: User-friendly message about the cancellation
- `refund_amount`: Amount to be refunded

**Error Handling**:
- Throws error if RPC call fails
- Returns error message from database function

#### `calculateRefundAmount(orderId)`
```typescript
export const calculateRefundAmount = async (orderId: string): Promise<number>
```

Calculates refund amount without cancelling the order (for preview).

### Frontend Implementation

#### Order History Page
**Features**:
- Cancel button for eligible orders
- Confirmation dialog with refund information
- Different messages for pending vs preparing orders
- Shows refund amount in success toast
- Displays refund information on cancelled orders

**Cancellation Flow**:
1. User clicks "Cancel Order" button
2. System checks if cancellation is allowed (time + status)
3. Shows confirmation dialog:
   - Pending: "Full refund will be processed"
   - Preparing: "50% refund as preparation has started"
4. User confirms cancellation
5. API call to cancel order
6. Success toast shows refund amount
7. Order list refreshes

**Display for Cancelled Orders**:
```tsx
{order.status === 'cancelled' && order.refund_amount !== null && (
  <p className="text-sm text-success mt-1">
    Refund: ₹{order.refund_amount.toFixed(2)} ({order.refund_status || 'pending'})
  </p>
)}
```

#### Order Confirmation Page
Similar implementation to Order History with:
- Cancel button
- Refund policy display
- Success/error notifications

### User Experience

#### Cancellation Messages
- **Success (Pending)**: "Order cancelled successfully. Full refund will be processed. Refund amount: ₹XX.XX"
- **Success (Preparing)**: "Order cancelled. 50% refund will be processed as preparation has started. Refund amount: ₹XX.XX"
- **Error (Too Late)**: "Cannot cancel order less than 1 hour before pickup time"
- **Error (Completed)**: "Cannot cancel completed order"
- **Error (Already Cancelled)**: "Order is already cancelled"

#### Visual Indicators
- Alert badge on preparing orders: "50% refund if cancelled now"
- Refund amount displayed on cancelled orders
- Refund status (pending/processed)
- Cancellation reason

---

## Requirement 2: Cash-on-Pickup Restrictions

### Business Rules
- **Snacks Only**: Cash-on-pickup payment only allowed for items in "Snacks" category
- **Maximum 2 Items**: Total quantity of snack items cannot exceed 2
- **Enforcement**: Orders violating these rules must use online payment (card/wallet)

### Database Implementation

#### Function: `validate_cash_on_pickup(order_items)`
Validates if cash-on-pickup is allowed for given order items.

**Logic**:
1. Loops through all order items
2. Checks category of each menu item
3. Counts snack items and non-snack items
4. Validates:
   - All items must be snacks
   - Total snack quantity ≤ 2

**Returns**:
```sql
TABLE(
  is_valid BOOLEAN,
  message TEXT
)
```

**Validation Rules**:
```sql
-- Non-snack items present
IF v_non_snack_count > 0 THEN
  RETURN 'Cash on pickup is only allowed for snack items. Please use online payment for non-snack items.'

-- Too many snack items
IF v_snack_count > 2 THEN
  RETURN 'Cash on pickup is limited to maximum 2 snack items. Please use online payment or reduce quantity.'

-- All validations passed
RETURN 'Cash on pickup is allowed for this order.'
```

**Example Usage**:
```sql
SELECT * FROM validate_cash_on_pickup(
  '[
    {"menu_item_id": "uuid-here", "quantity": 2}
  ]'::jsonb
);
```

### Backend API

#### `validateCashOnPickup(orderItems)`
```typescript
export const validateCashOnPickup = async (
  orderItems: Array<{ menu_item_id: string; quantity: number }>
): Promise<{ is_valid: boolean; message: string }>
```

**Parameters**:
- `orderItems`: Array of items with menu_item_id and quantity

**Returns**:
- `is_valid`: Whether cash-on-pickup is allowed
- `message`: Explanation message

### Frontend Implementation

#### Checkout Page

**State Management**:
```typescript
const [cashOnPickupAllowed, setCashOnPickupAllowed] = useState(true);
const [cashOnPickupMessage, setCashOnPickupMessage] = useState('');
```

**Validation on Cart Change**:
```typescript
useEffect(() => {
  if (cartItems.length > 0) {
    validateCashOnPickupEligibility();
  }
}, [cartItems]);

const validateCashOnPickupEligibility = async () => {
  const orderItems = cartItems.map(item => ({
    menu_item_id: item.menuItem.id,
    quantity: item.quantity,
  }));

  const validation = await validateCashOnPickup(orderItems);
  setCashOnPickupAllowed(validation.is_valid);
  setCashOnPickupMessage(validation.message);

  // Auto-switch to card if not allowed
  if (!validation.is_valid && paymentMethod === 'cash_on_pickup') {
    setPaymentMethod('card');
  }
};
```

**UI Implementation**:
```tsx
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

{!cashOnPickupAllowed && (
  <Alert className="mt-4">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription className="text-sm">
      {cashOnPickupMessage}
    </AlertDescription>
  </Alert>
)}
```

### User Experience

#### Validation Messages
- **Non-snack items**: "Cash on pickup is only allowed for snack items. Please use online payment for non-snack items."
- **Too many items**: "Cash on pickup is limited to maximum 2 snack items. Please use online payment or reduce quantity."
- **Allowed**: "Cash on pickup is allowed for this order."

#### Visual Feedback
- **Disabled State**: Cash-on-pickup option grayed out when not allowed
- **Helper Text**: Shows "Only available for snack items (max 2)" below disabled option
- **Alert Box**: Displays detailed restriction message
- **Auto-switch**: Automatically switches to card payment if restrictions violated

#### Example Scenarios

**Scenario 1: Valid - 2 Samosas**
- Items: 2x Samosa (Snacks category)
- Cash-on-pickup: ✅ Allowed
- Message: "Cash on pickup is allowed for this order."

**Scenario 2: Invalid - 3 Samosas**
- Items: 3x Samosa (Snacks category)
- Cash-on-pickup: ❌ Disabled
- Message: "Cash on pickup is limited to maximum 2 snack items. Please use online payment or reduce quantity."

**Scenario 3: Invalid - Mixed Items**
- Items: 1x Samosa (Snacks) + 1x Idli Sambar (South Indian)
- Cash-on-pickup: ❌ Disabled
- Message: "Cash on pickup is only allowed for snack items. Please use online payment for non-snack items."

**Scenario 4: Valid - 1 Snack Item**
- Items: 1x Samosa (Snacks category)
- Cash-on-pickup: ✅ Allowed
- Message: "Cash on pickup is allowed for this order."

---

## Testing

### Database Function Tests

#### Test 1: Validate Cash-on-Pickup (Valid)
```sql
SELECT * FROM validate_cash_on_pickup(
  '[{"menu_item_id": "1dec4ce0-1a31-4c74-9d83-378a9dd2d4c8", "quantity": 2}]'::jsonb
);
-- Expected: is_valid = true
```

#### Test 2: Validate Cash-on-Pickup (Too Many)
```sql
SELECT * FROM validate_cash_on_pickup(
  '[{"menu_item_id": "1dec4ce0-1a31-4c74-9d83-378a9dd2d4c8", "quantity": 3}]'::jsonb
);
-- Expected: is_valid = false, message about max 2 items
```

#### Test 3: Validate Cash-on-Pickup (Non-snack)
```sql
SELECT * FROM validate_cash_on_pickup(
  '[{"menu_item_id": "c4808310-0dd0-4f46-84d7-a0eac1f1aafe", "quantity": 1}]'::jsonb
);
-- Expected: is_valid = false, message about snacks only
```

### Frontend Testing

#### Order Cancellation
1. Create an order with status 'pending'
2. Navigate to Order History
3. Click "Cancel Order"
4. Verify confirmation dialog shows "Full refund"
5. Confirm cancellation
6. Verify success toast shows refund amount
7. Verify order status changes to 'cancelled'
8. Verify refund amount is displayed

#### Cash-on-Pickup Restrictions
1. Add 2 snack items to cart
2. Go to checkout
3. Verify cash-on-pickup is enabled
4. Add 1 more snack item
5. Verify cash-on-pickup is disabled
6. Verify alert message appears
7. Remove 1 item
8. Verify cash-on-pickup is enabled again

---

## Files Modified

### Database
- **Migration**: `add_order_cancellation_and_restrictions.sql`
  - Added refund_status and cancelled_at fields
  - Created calculate_refund_amount function
  - Created cancel_order function
  - Created validate_cash_on_pickup function
  - Granted permissions

### Backend
- **src/db/api.ts**
  - Added cancelOrder function
  - Added calculateRefundAmount function
  - Added validateCashOnPickup function
  - Removed old cancelOrder implementation

- **src/types/types.ts**
  - Added refund_status field to Order interface
  - Added cancelled_at field to Order interface

### Frontend
- **src/pages/Checkout.tsx**
  - Added cash-on-pickup validation
  - Added state for cashOnPickupAllowed
  - Added useEffect for validation
  - Updated payment method UI
  - Added restriction alert

- **src/pages/OrderHistory.tsx**
  - Updated cancelOrder call with new signature
  - Added refund amount display
  - Added refund status display
  - Added cancellation reason display

- **src/pages/OrderConfirmation.tsx**
  - Updated cancelOrder call with new signature
  - Added useAuth import
  - Added refund amount in toast

---

## Benefits

### For Users
- **Clear Refund Policy**: Know exactly how much refund to expect
- **Time-based Cancellation**: Can cancel up to 1 hour before pickup
- **Transparent Process**: See refund amount immediately after cancellation
- **Payment Flexibility**: Clear rules about cash-on-pickup eligibility
- **Prevents Errors**: System prevents invalid payment method selection

### For Canteen
- **Reduce Food Waste**: 50% refund policy discourages late cancellations
- **Compensation for Preparation**: Partial refund covers preparation costs
- **Bulk Order Prevention**: Cash-on-pickup limit prevents large unpaid orders
- **Inventory Management**: Better planning with cancellation restrictions
- **Payment Security**: Ensures online payment for larger orders

### For System
- **Automated Refund Calculation**: No manual intervention needed
- **Audit Trail**: Tracks cancellation reason and timestamp
- **Data Integrity**: Validates all cancellation requests
- **Business Rule Enforcement**: Automatically enforces payment restrictions
- **Consistent Experience**: Same rules applied across all users

---

## Status
✅ **COMPLETED** - All features implemented and tested

## Date
2026-02-05
