# Task: Order Cancellation & Cash-on-Pickup Restrictions

## Requirements

### Requirement 1: Order Cancellation and Refund Policy (REVISED & ENHANCED)
- Provide "Cancel Order" option in Order Details screen
- User can cancel by selecting option and confirming
- **"Not Yet Started Preparing" status**: Cancel immediately with 100% refund
- **"Preparation Started" status**: Show warning message, 50% refund upon confirmation
- Clear messaging about refund policy and reasons

### Requirement 2: Cash on Pickup Restriction for Snacks
- Cash on pickup only allowed for snack items
- Maximum 2 snack items per cash-on-pickup order
- Orders exceeding limit must use online payment

## Plan
- [x] Database Layer
  - [x] Add refund tracking fields to orders table
  - [x] Create cancel_order function with refund logic
  - [x] Add validation for cash-on-pickup restrictions
- [x] Backend API
  - [x] Add cancelOrder() function
  - [x] Add validateCashOnPickup() function
  - [x] Add calculateRefundAmount() function
- [x] Frontend - Order Details/History
  - [x] Update cancel button with new API
  - [x] Create professional cancel dialog component
  - [x] Show clear status labels ("Not Yet Started Preparing", "Preparation Started")
  - [x] Display refund policy information with breakdown
  - [x] Show warning for partial refund with explanation
  - [x] Display refund amount after cancellation
  - [x] Show cancellation deadline (1-2 hours before pickup)
- [x] Frontend - Checkout
  - [x] Validate cash-on-pickup eligibility
  - [x] Show error if restrictions violated
  - [x] Disable cash-on-pickup option when not allowed
  - [x] Show helpful messages about restrictions
- [x] UI/UX Enhancements
  - [x] Professional AlertDialog for cancellation
  - [x] Different dialogs for "Not Started" vs "Preparation Started"
  - [x] Refund breakdown showing order amount, refund amount, retained amount
  - [x] Clear explanation of retention reason (preparation cost & food wastage)
  - [x] Color-coded messaging (success for full refund, warning for partial)
  - [x] User-friendly status labels throughout the app

## Completed Features

### Enhanced Cancellation Dialog
Created `CancelOrderDialog` component with:
- **Two Different Flows**:
  1. **Not Yet Started Preparing**: Green success theme, full refund message
  2. **Preparation Started**: Yellow warning theme, partial refund warning

- **Detailed Information Display**:
  - Order amount
  - Refund amount with percentage
  - Retained amount (for partial refunds)
  - Clear explanation of retention reason
  - Refund processing timeline

- **Visual Design**:
  - Icon indicators (CheckCircle for full refund, AlertTriangle for partial)
  - Color-coded backgrounds (success/warning)
  - Professional layout with proper spacing
  - Clear action buttons ("No, Keep Order" / "Yes, Cancel Order")

### Status Label Improvements
Created `order-status-utils.ts` with helper functions:
- `getOrderStatusLabel()`: Converts technical status to user-friendly labels
  - "pending" → "Not Yet Started Preparing"
  - "preparing" → "Preparation Started"
  - "ready" → "Ready for Pickup"
  - etc.
- `getOrderStatusDescription()`: Provides detailed status descriptions
- `isPreparationStarted()`: Checks if preparation has begun
- `canOrderBeCancelled()`: Validates cancellation eligibility

### Updated Pages
- **OrderHistory**: Uses new dialog and status labels
- **OrderConfirmation**: Uses new dialog and status labels
- Both pages show clear, user-friendly status information

### Database (Already Implemented)
- `refund_status` and `cancelled_at` fields
- `calculate_refund_amount(order_id)` function
- `cancel_order(order_id, user_id, reason)` function
- `validate_cash_on_pickup(order_items)` function

### Backend API (Already Implemented)
- `cancelOrder(orderId, userId, reason)`
- `validateCashOnPickup(orderItems)`
- `calculateRefundAmount(orderId)`

### Frontend - Checkout (Already Implemented)
- Real-time cash-on-pickup validation
- Automatic disabling when restrictions violated
- Clear error messages and visual feedback

## User Experience Flow

### Cancelling "Not Yet Started Preparing" Order
1. User clicks "Cancel Order" button
2. System checks time and status eligibility
3. Dialog opens with:
   - ✓ Green success indicator
   - "Order Not Yet Started Preparing" message
   - Full refund amount displayed
   - "You will receive a full refund" message
4. User clicks "Yes, Cancel Order"
5. Order cancelled immediately
6. Success toast shows refund amount
7. Order list refreshes

### Cancelling "Preparation Started" Order
1. User clicks "Cancel Order" button
2. System checks time and status eligibility
3. Dialog opens with:
   - ⚠️ Yellow warning indicator
   - "Preparation Started - Partial Refund" title
   - Warning box explaining partial refund
   - Breakdown showing:
     * Order Amount: ₹XX.XX
     * Refund Amount: ₹XX.XX (50%)
     * Retained Amount: ₹XX.XX
   - Explanation: "Retained amount covers preparation costs and food wastage"
4. User confirms understanding
5. User clicks "Yes, Cancel Order"
6. Order cancelled with 50% refund
7. Success toast shows refund amount
8. Order list refreshes

## Files Created/Modified

### New Files
- `src/components/ui/CancelOrderDialog.tsx`: Professional cancellation dialog
- `src/lib/order-status-utils.ts`: Status label helper functions

### Modified Files
- `src/pages/OrderHistory.tsx`: Integrated new dialog and status labels
- `src/pages/OrderConfirmation.tsx`: Integrated new dialog and status labels

### Previously Created (Requirement 1 & 2)
- Database migration with cancel_order and validate_cash_on_pickup functions
- Backend API functions in src/db/api.ts
- Checkout page with cash-on-pickup validation
- Order type updates in src/types/types.ts

## Notes
- Dialog uses shadcn/ui AlertDialog component for consistency
- Status labels are centralized in utility file for easy maintenance
- Color coding follows semantic meaning (success=green, warning=yellow)
- All messaging is clear and user-friendly
- Refund breakdown helps users understand the policy
- Explanation of retention reduces user frustration


