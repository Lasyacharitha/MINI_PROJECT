# Testing Order Cancellation Feature

## Overview
The order cancellation feature is now fully implemented. This guide will help you test all aspects of the cancellation system.

## Current Test Orders

I've created three test orders with different statuses to demonstrate the cancellation feature:

### Order 1: Pending Status (Full Refund)
- **Order ID**: b6e016e9-e855-4618-a2d8-f4bca612cca8
- **Status**: Pending
- **Pickup Time**: 18:00 (6:00 PM)
- **Amount**: ₹40.00
- **Can Cancel**: ✅ Yes
- **Refund**: 100% (Full refund)
- **Reason**: Order not yet confirmed by kitchen

### Order 2: Confirmed Status (Full Refund)
- **Order ID**: 805b6eed-785f-4399-81c7-4031c9564bec
- **Status**: Confirmed
- **Pickup Time**: 20:00 (8:00 PM)
- **Amount**: ₹50.00
- **Can Cancel**: ✅ Yes
- **Refund**: 100% (Full refund)
- **Reason**: Kitchen hasn't started preparation yet

### Order 3: Preparing Status (Partial Refund)
- **Order ID**: 45868eda-b969-40ae-9136-ab03d9cfe4ef
- **Status**: Preparing
- **Pickup Time**: 19:30 (7:30 PM)
- **Amount**: ₹40.00
- **Can Cancel**: ⚠️ Yes (with warning)
- **Refund**: 50% (Partial refund - ₹20.00)
- **Reason**: Kitchen has started preparing the order

## How to Test

### Step 1: View Orders
1. Log in to your account
2. Navigate to **Order History** page (click "Orders" in navigation)
3. You should see all three orders listed

### Step 2: Test Full Refund Cancellation
1. Find the order with **Pending** or **Confirmed** status
2. You should see a red **"Cancel Order"** button
3. Click the button
4. A confirmation dialog will appear: "Are you sure you want to cancel this order? You will receive a full refund."
5. Click **OK** to confirm
6. Order status will change to **Cancelled**
7. You'll see a success message: "Order cancelled successfully. Refund: ₹40.00 (100%)"

### Step 3: Test Partial Refund Cancellation
1. Find the order with **Preparing** status
2. You should see:
   - A red **"Cancel Order"** button
   - A warning alert: "50% refund if cancelled now"
3. Click the cancel button
4. A confirmation dialog will appear: "Kitchen has started preparing your order. You will receive only 50% refund. Do you want to continue?"
5. Click **OK** to confirm
6. Order status will change to **Cancelled**
7. You'll see a success message: "Order cancelled successfully. Refund: ₹20.00 (50%)"

### Step 4: Test Order Confirmation Page
1. Click **"View Details"** on any order
2. You'll be taken to the Order Confirmation page
3. If the order can be cancelled, you'll see:
   - A warning alert at the bottom explaining the refund policy
   - A red **"Cancel Order"** button
4. Click the cancel button to test cancellation from this page
5. After cancellation, you'll be redirected to Order History

### Step 5: Test Time Restrictions
To test the 2-hour restriction:
1. Create a new order with a pickup time less than 2 hours from now
2. Try to cancel it
3. You should see an error: "Orders can only be cancelled up to 2 hours before pickup time"

### Step 6: Test Completed Orders
1. If you have any completed orders, try to view them
2. The cancel button should NOT appear
3. This is correct behavior - completed orders cannot be cancelled

## Expected Behavior

### Cancel Button Visibility
| Order Status | Time Until Pickup | Cancel Button Visible? |
|--------------|-------------------|------------------------|
| Pending      | > 2 hours         | ✅ Yes                 |
| Confirmed    | > 2 hours         | ✅ Yes                 |
| Preparing    | > 2 hours         | ⚠️ Yes (with warning)  |
| Ready        | > 2 hours         | ⚠️ Yes (with warning)  |
| Completed    | Any               | ❌ No                  |
| Cancelled    | Any               | ❌ No                  |
| Any Status   | < 2 hours         | ❌ No                  |

### Refund Amounts
- **Pending/Confirmed**: 100% full refund
- **Preparing/Ready**: 50% partial refund
- **Completed/Cancelled**: No refund (cannot cancel)

### User Notifications
After cancellation, users receive:
1. **Toast notification**: Success message with refund amount
2. **In-app notification**: Stored in notifications table
3. **Visual update**: Order status badge changes to "Cancelled"

## Troubleshooting

### "Cancel button not showing"
**Possible reasons:**
1. Order pickup time is less than 2 hours away
2. Order status is "completed" or "cancelled"
3. Order pickup time is in the past

**Solution:** Check the order's pickup time and status. The button only shows for eligible orders.

### "Cannot cancel order" error
**Possible reasons:**
1. Trying to cancel within 2 hours of pickup
2. Order already completed or cancelled

**Solution:** This is expected behavior. The system is working correctly.

### "Cancellation not processing"
**Possible reasons:**
1. Network error
2. Database permission issue

**Solution:** Check browser console for errors and verify database connection.

## Testing Checklist

- [ ] View Order History page
- [ ] See cancel button on pending order
- [ ] Cancel pending order (full refund)
- [ ] See success notification
- [ ] Verify order status changed to "cancelled"
- [ ] See cancel button on confirmed order
- [ ] Cancel confirmed order (full refund)
- [ ] See cancel button with warning on preparing order
- [ ] Cancel preparing order (partial refund)
- [ ] Confirm 50% refund amount shown
- [ ] View order details page
- [ ] Cancel order from details page
- [ ] Verify redirect after cancellation
- [ ] Check that completed orders don't show cancel button
- [ ] Check that cancelled orders don't show cancel button

## Additional Notes

### Current Time
The system uses UTC time. Current time is approximately **12:47 UTC** on **February 5, 2026**.

### Test Order Pickup Times
- Order 1: 18:00 (5+ hours away) ✅ Can cancel
- Order 2: 20:00 (7+ hours away) ✅ Can cancel
- Order 3: 19:30 (6+ hours away) ✅ Can cancel

All test orders are more than 2 hours away, so they should all show the cancel button.

### Creating New Test Orders
To create more test orders for testing:
1. Go to Menu page
2. Add items to cart
3. Proceed to checkout
4. Select a pickup time more than 2 hours in the future
5. Complete the order
6. Go to Order History to test cancellation

## Success Criteria

The cancellation feature is working correctly if:
1. ✅ Cancel button appears for eligible orders
2. ✅ Confirmation dialog shows correct refund amount
3. ✅ Order status updates to "cancelled" after confirmation
4. ✅ Success notification displays refund details
5. ✅ Time restriction (2 hours) is enforced
6. ✅ Status-based refunds work correctly (100% vs 50%)
7. ✅ Completed/cancelled orders don't show cancel button
8. ✅ User notifications are created in database
