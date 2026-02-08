# Three-Tier Refund Policy Implementation

## Overview
Implemented automatic refund calculation system with three distinct refund tiers based on order status, meeting the exact requirements specified.

## Refund Policy Rules

### Tier 1: Pending Orders - 100% Refund ✅
**Status**: `pending` or `confirmed`
**Refund**: Full refund (100% of order amount)
**Reason**: Order hasn't been started yet, no preparation costs incurred

**Example**:
- Order Amount: ₹60.00
- Refund Amount: ₹60.00 (100%)
- User Gets Back: ₹60.00

### Tier 2: Preparing Orders - 50% Refund ⚠️
**Status**: `preparing`
**Refund**: Partial refund (50% of order amount)
**Reason**: Kitchen has started preparation, costs already incurred

**Example**:
- Order Amount: ₹80.00
- Refund Amount: ₹40.00 (50%)
- Retained Amount: ₹40.00 (covers preparation costs)
- User Gets Back: ₹40.00

### Tier 3: Ready Orders - 0% Refund ❌
**Status**: `ready`
**Refund**: No refund (0% of order amount)
**Reason**: Food is fully prepared and ready for pickup

**Example**:
- Order Amount: ₹100.00
- Refund Amount: ₹0.00 (0%)
- Retained Amount: ₹100.00 (food is prepared)
- User Gets Back: ₹0.00

## System Implementation

### 1. Database Layer

#### Function: `calculate_refund_amount(order_id)`
Automatically calculates refund based on order status.

**Logic**:
```sql
CASE order_status
  WHEN 'pending', 'confirmed' THEN total_amount * 1.0    -- 100%
  WHEN 'preparing' THEN total_amount * 0.5                -- 50%
  WHEN 'ready' THEN 0                                     -- 0%
  ELSE 0                                                  -- No refund
END
```

**Returns**: Numeric value (refund amount)

#### Function: `cancel_order(order_id, user_id, reason)`
Handles order cancellation with automatic refund calculation.

**Process**:
1. Validates order ownership
2. Checks order status (cannot cancel completed/cancelled)
3. Validates time restriction (1 hour before pickup)
4. Calculates refund using `calculate_refund_amount()`
5. Updates order:
   - Sets status to 'cancelled'
   - Records refund_amount
   - Sets refund_status ('pending' or 'not_applicable')
   - Records cancelled_at timestamp
   - Saves cancellation_reason
6. Returns success message with refund amount

**Return Messages**:
- Pending: "Order cancelled successfully. Full refund will be processed."
- Preparing: "Order cancelled. 50% refund will be processed as preparation has started."
- Ready: "Order cancelled. No refund available as order is ready for pickup."

### 2. Frontend Components

#### CancelOrderDialog Component
Professional dialog with three distinct visual themes.

**Scenario 1: Pending Order (Green Theme)**
```
Icon: ✓ CheckCircle (green)
Title: "Cancel Order"
Message Box: Green background
Content:
  - "Order Not Yet Started Preparing"
  - "You will receive a full refund"
  - Order Amount: ₹XX.XX
  - Refund Amount: ₹XX.XX (100%)
  - Processing info
Button: Red "Yes, Cancel Order"
```

**Scenario 2: Preparing Order (Yellow Theme)**
```
Icon: ⚠️ AlertTriangle (yellow)
Title: "Preparation Started - Partial Refund"
Message Box: Yellow warning background
Content:
  - "Warning: Partial Refund Only"
  - Explanation of partial refund
  - Order Amount: ₹XX.XX
  - Refund Amount: ₹XX.XX (50%)
  - Retained Amount: ₹XX.XX
  - Reason for retention
Button: Yellow "Yes, Cancel Order"
```

**Scenario 3: Ready Order (Red Theme)**
```
Icon: ❌ XCircle (red)
Title: "Ready for Pickup - No Refund"
Message Box: Red destructive background
Content:
  - "No Refund Available"
  - "Order is already prepared and ready"
  - Order Amount: ₹XX.XX
  - Refund Amount: ₹0.00 (0%)
  - Amount Retained: ₹XX.XX
  - Explanation about prepared food
Button: Red "Yes, Cancel Order"
```

#### Order History Page
**Features**:
- Cancel button visible for pending, preparing, and ready orders
- Status-specific alert messages:
  - Preparing: "50% refund if cancelled now" (yellow alert)
  - Ready: "No refund available - order is ready" (red alert)
- Automatic refund calculation on button click
- Dialog opens with appropriate theme

#### Order Confirmation Page
Same features as Order History page for consistency.

### 3. Refund Calculation Logic

**Frontend Helper Function**:
```typescript
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
```

## Testing

### Test Orders Created

I've created three test orders to demonstrate each scenario:

#### Test Order 1: Pending (100% Refund)
```
Order ID: bc7ac8e3-e160-41f8-a6be-5e145af1d624
Status: pending
Pickup Time: 22:00 (10:00 PM)
Amount: ₹60.00
Expected Refund: ₹60.00 (100%)
Dialog Theme: Green (Success)
```

#### Test Order 2: Preparing (50% Refund)
```
Order ID: cd8c7ebb-e696-4c51-b735-3cc062af8a74
Status: preparing
Pickup Time: 22:30 (10:30 PM)
Amount: ₹80.00
Expected Refund: ₹40.00 (50%)
Dialog Theme: Yellow (Warning)
```

#### Test Order 3: Ready (0% Refund)
```
Order ID: 64184af5-aeb5-48a3-9cd5-1de157288720
Status: ready
Pickup Time: 23:00 (11:00 PM)
Amount: ₹100.00
Expected Refund: ₹0.00 (0%)
Dialog Theme: Red (Destructive)
```

### Testing Steps

#### Test Pending Order (100% Refund)
1. Go to Order History
2. Find order with "Not Yet Started Preparing" status
3. Click "Cancel Order" button
4. Green dialog appears with:
   - ✓ Success icon
   - Full refund message
   - 100% refund breakdown
5. Click "Yes, Cancel Order"
6. Success toast: "Order cancelled successfully. Full refund will be processed. Refund amount: ₹60.00"
7. Order status changes to "Cancelled"
8. Refund amount: ₹60.00 (pending)

#### Test Preparing Order (50% Refund)
1. Go to Order History
2. Find order with "Preparation Started" status
3. See yellow alert: "50% refund if cancelled now"
4. Click "Cancel Order" button
5. Yellow dialog appears with:
   - ⚠️ Warning icon
   - Partial refund warning
   - 50% refund breakdown
   - Explanation of retention
6. Click "Yes, Cancel Order"
7. Success toast: "Order cancelled. 50% refund will be processed as preparation has started. Refund amount: ₹40.00"
8. Order status changes to "Cancelled"
9. Refund amount: ₹40.00 (pending)

#### Test Ready Order (0% Refund)
1. Go to Order History
2. Find order with "Ready for Pickup" status
3. See red alert: "No refund available - order is ready"
4. Click "Cancel Order" button
5. Red dialog appears with:
   - ❌ X icon
   - No refund message
   - 0% refund breakdown
   - Explanation about prepared food
6. Click "Yes, Cancel Order"
7. Success toast: "Order cancelled. No refund available as order is ready for pickup. Refund amount: ₹0.00"
8. Order status changes to "Cancelled"
9. Refund amount: ₹0.00 (not_applicable)

### Database Testing Results

**Refund Calculation Test**:
```sql
-- Tested calculate_refund_amount() function
Pending (₹60.00):   Returns ₹60.00  ✅ (100%)
Preparing (₹80.00): Returns ₹40.00  ✅ (50%)
Ready (₹100.00):    Returns ₹0.00   ✅ (0%)
```

**Cancel Order Test**:
```sql
-- Tested cancel_order() function with pending order
Input: order_id, user_id, reason
Output: 
  success: true
  message: "Order cancelled successfully. Full refund will be processed."
  refund_amount: 60.00
  
Database Updates:
  status: 'cancelled' ✅
  refund_amount: 60.00 ✅
  refund_status: 'pending' ✅
  cancelled_at: timestamp ✅
  cancellation_reason: saved ✅
```

## User Experience Flow

### Flow 1: Cancelling Pending Order
```
User Action → System Response
────────────────────────────────
View order → Shows "Not Yet Started Preparing" badge
Click cancel → Opens green success dialog
Review info → Sees 100% refund breakdown
Confirm → Processes cancellation
Result → Full refund, success message
```

### Flow 2: Cancelling Preparing Order
```
User Action → System Response
────────────────────────────────
View order → Shows "Preparation Started" badge
See alert → "50% refund if cancelled now"
Click cancel → Opens yellow warning dialog
Review info → Sees 50% refund + retention explanation
Confirm → Processes cancellation
Result → 50% refund, warning message
```

### Flow 3: Cancelling Ready Order
```
User Action → System Response
────────────────────────────────
View order → Shows "Ready for Pickup" badge
See alert → "No refund available - order is ready"
Click cancel → Opens red destructive dialog
Review info → Sees 0% refund + prepared food explanation
Confirm → Processes cancellation
Result → No refund, informative message
```

## Benefits

### For Users
- **Clear Expectations**: Know exactly what refund to expect before cancelling
- **Transparent Policy**: Understand why refund varies by status
- **Visual Clarity**: Color-coded dialogs make policy obvious
- **Detailed Breakdown**: See exact amounts before confirming

### For Canteen
- **Automatic Calculation**: No manual refund processing needed
- **Fair Policy**: Covers costs based on preparation stage
- **Reduced Waste**: Discourages late cancellations
- **Clear Communication**: Reduces disputes and complaints

### For System
- **Automated**: Refund calculated automatically by database
- **Consistent**: Same rules applied to all orders
- **Auditable**: All cancellations tracked with timestamps
- **Scalable**: Easy to adjust percentages if needed

## Key Features

### Automatic Refund Calculation ✅
- System automatically checks order status
- Calculates refund based on three-tier policy
- No manual intervention required

### Status-Based Logic ✅
- Pending/Confirmed: 100% refund
- Preparing: 50% refund
- Ready: 0% refund
- Completed/Cancelled: Cannot cancel

### Database Updates ✅
- Order status changed to 'cancelled'
- Refund amount recorded
- Refund status set appropriately
- Cancellation timestamp saved
- Reason stored for audit

### User Interface ✅
- Three distinct dialog themes
- Clear visual indicators
- Detailed refund breakdowns
- Explanatory messages
- Status-specific alerts

## Files Modified

### Database
- **Migration**: `update_refund_policy_ready_status.sql`
  - Updated `calculate_refund_amount()` function
  - Updated `cancel_order()` function
  - Added 0% refund for 'ready' status

### Frontend Components
- **src/components/ui/CancelOrderDialog.tsx**
  - Added third scenario for ready orders
  - Red destructive theme for 0% refund
  - XCircle icon for no refund
  - Detailed explanation of no refund policy

### Frontend Pages
- **src/pages/OrderHistory.tsx**
  - Updated `getRefundInfo()` to handle ready status
  - Added red alert for ready orders
  - Updated refund calculation logic

- **src/pages/OrderConfirmation.tsx**
  - Updated `getRefundInfo()` to handle ready status
  - Consistent with OrderHistory implementation

## Summary

### Requirements Met ✅

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Pending: 100% refund | ✅ Complete | Database + Frontend |
| Preparing: 50% refund | ✅ Complete | Database + Frontend |
| Ready: 0% refund | ✅ Complete | Database + Frontend |
| Automatic status check | ✅ Complete | Database function |
| Automatic refund calculation | ✅ Complete | Database function |
| Update order on cancel | ✅ Complete | Database function |
| Refund correct amount | ✅ Complete | Database function |

### System Behavior

**Automatic Process**:
1. User clicks "Cancel Order"
2. System checks current order status
3. System calculates refund based on status
4. System shows appropriate dialog with refund info
5. User confirms cancellation
6. System updates order and records refund
7. User sees success message with refund amount

**No Manual Intervention Required** - Everything is automated!

## Status
✅ **COMPLETED** - All requirements implemented and tested

## Date
2026-02-05
