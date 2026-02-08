# Cancel Order Button - Troubleshooting Guide

## Issue Report
User reports that the "Cancel Order" button is not displaying.

## Root Cause Analysis

### Why the Button Wasn't Showing

The cancel button has **intentional visibility rules** based on business requirements:

1. **Time Restriction**: Orders can only be cancelled at least **2 hours before pickup time**
2. **Status Restriction**: Only certain statuses allow cancellation

### The Problem with Existing Orders

Your existing orders in the database have pickup times that have already passed:
- Most orders: **07:30 AM** (7:30 AM today)
- Current time: **~3:12 PM** (15:12 UTC)
- Result: These orders are **past their pickup time**, so cancellation is not allowed

## Solution: Test Orders Created

I've created new test orders with **future pickup times** so you can test the cancel functionality:

### Test Order 1: Full Refund Scenario
```
Order ID: 8b8e7902-9c56-4f41-a067-deac35c365dc
Status: pending (Not Yet Started Preparing)
Pickup Time: 18:00 (6:00 PM today)
Amount: ₹40.00
Expected Refund: 100%
Cancel Button: ✅ SHOULD BE VISIBLE
```

### Test Order 2: Partial Refund Scenario
```
Order ID: 8955eca5-b021-4fdf-ae54-1ee1279422f1
Status: preparing (Preparation Started)
Pickup Time: 19:00 (7:00 PM today)
Amount: ₹50.00
Expected Refund: 50%
Cancel Button: ✅ SHOULD BE VISIBLE
```

## How to See the Cancel Button

### Step 1: Go to Order History
```
Navigation: Click "Orders" in the menu
URL: /orders
```

### Step 2: Look for Orders with Future Pickup Times
The cancel button will ONLY appear on orders that meet ALL these conditions:

✅ **Status is cancellable**:
- pending
- confirmed  
- preparing

✅ **Pickup time is in the future**:
- At least 2 hours from now

✅ **Order is not already cancelled or completed**

### Step 3: Identify the Button
The cancel button looks like this:
```
[🗙 Cancel Order]  ← Red button with X icon
```

It appears below the "View Details" button.

## Button Visibility Logic

### Code Logic (from OrderHistory.tsx)
```typescript
const canCancelThisOrder = (order: OrderWithItems): boolean => {
  // Cannot cancel if already completed or cancelled
  if (['completed', 'cancelled'].includes(order.status)) {
    return false;
  }
  
  // Check time restriction (2 hours before pickup)
  return canCancelOrder(order.pickup_date, order.pickup_time);
};
```

### Time Check Logic (from date-utils.ts)
```typescript
export const canCancelOrder = (pickupDate: string, pickupTime: string, hoursBeforePickup = 2): boolean => {
  const now = new Date();
  const pickup = parse(`${pickupDate} ${pickupTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const minutesUntilPickup = differenceInMinutes(pickup, now);
  
  return minutesUntilPickup > (hoursBeforePickup * 60);  // Must be > 120 minutes
};
```

## Visual Guide: When Button Appears

### ✅ Button WILL Appear
```
Order Status: Pending
Pickup Time: 18:00 (6 PM)
Current Time: 15:12 (3:12 PM)
Time Until Pickup: 2 hours 48 minutes
Result: ✅ Button visible (> 2 hours)
```

```
Order Status: Preparing
Pickup Time: 19:00 (7 PM)
Current Time: 15:12 (3:12 PM)
Time Until Pickup: 3 hours 48 minutes
Result: ✅ Button visible (> 2 hours)
```

### ❌ Button Will NOT Appear
```
Order Status: Pending
Pickup Time: 07:30 (7:30 AM)
Current Time: 15:12 (3:12 PM)
Time Until Pickup: -7 hours 42 minutes (PAST)
Result: ❌ Button hidden (pickup time passed)
```

```
Order Status: Completed
Pickup Time: Any
Result: ❌ Button hidden (order completed)
```

```
Order Status: Cancelled
Pickup Time: Any
Result: ❌ Button hidden (already cancelled)
```

## Testing Instructions

### Quick Test (5 minutes)

1. **Open the application** in your browser

2. **Navigate to Order History**
   - Click "Orders" in the navigation menu
   - Or go directly to `/orders`

3. **Scroll through your orders**
   - Look for orders with pickup times: **18:00** or **19:00**
   - These are the test orders I created

4. **Find the Cancel Button**
   - Should be a **red button** below "View Details"
   - Text: "Cancel Order"
   - Icon: X circle

5. **Click the Cancel Button**
   - For 18:00 order (pending): Green dialog with 100% refund
   - For 19:00 order (preparing): Yellow dialog with 50% refund

6. **Test the Dialog**
   - Review the refund information
   - Click "Yes, Cancel Order"
   - See success toast with refund amount
   - Order status changes to "Cancelled"

### If Button Still Not Visible

#### Check 1: Verify Current Time
```bash
# The button requires at least 2 hours before pickup
Current Time: 15:12 (3:12 PM)
Order Pickup: 18:00 (6:00 PM)
Time Difference: 2h 48m ✅ (> 2 hours, button should show)
```

If it's now past **16:00 (4 PM)**, the 18:00 order won't be cancellable anymore.

#### Check 2: Refresh the Page
- Press F5 or Ctrl+R
- Make sure the order list is fully loaded
- Check if the new test orders appear

#### Check 3: Verify You're Logged In
- The orders must belong to your user account
- Check if you see the orders in the list
- If not, you might be logged in as a different user

#### Check 4: Browser Console
- Press F12 to open developer tools
- Go to Console tab
- Look for any JavaScript errors
- Share any errors you see

#### Check 5: Network Tab
- Open developer tools (F12)
- Go to Network tab
- Refresh the page
- Check if the orders API call succeeds
- Look for `/rest/v1/orders` request
- Verify it returns the test orders

## Creating Additional Test Orders

If you need more test orders with even later pickup times, use this SQL:

```sql
-- Create order with 21:00 (9 PM) pickup time
WITH user_data AS (
  SELECT id FROM profiles LIMIT 1
),
menu_item AS (
  SELECT id, price FROM menu_items WHERE name = 'Samosa' LIMIT 1
),
new_order AS (
  INSERT INTO orders (
    user_id,
    total_amount,
    status,
    pickup_date,
    pickup_time,
    pickup_slot,
    payment_method,
    payment_completed,
    payment_token,
    qr_code
  )
  SELECT 
    user_data.id,
    menu_item.price * 2,
    'pending',
    CURRENT_DATE,
    '21:00:00'::time,  -- 9 PM
    '21:00-21:30',
    'card',
    true,
    'TEST-TOKEN-' || gen_random_uuid()::text,
    'TEST-QR-' || gen_random_uuid()::text
  FROM user_data, menu_item
  RETURNING id, user_id, total_amount
)
INSERT INTO order_items (order_id, menu_item_id, quantity, price)
SELECT 
  new_order.id,
  menu_item.id,
  2,
  menu_item.price
FROM new_order, menu_item
RETURNING order_id, quantity, price;
```

## Expected Visual Appearance

### Order Card with Cancel Button
```
┌─────────────────────────────────────────────────────┐
│ Order #8b8e7902                                     │
│ [Not Yet Started Preparing] ← Green badge          │
│                                                     │
│ 📅 Pickup: February 5, 2026 at 6:00 PM            │
│ 💰 Total: ₹40.00                                   │
│                                                     │
│ Items:                                             │
│ • Idli Sambar x2                                   │
│                                                     │
│ [👁 View Details]  ← Gray button                   │
│ [🗙 Cancel Order]  ← RED BUTTON (This one!)       │
└─────────────────────────────────────────────────────┘
```

### Order Card WITHOUT Cancel Button (Past Pickup)
```
┌─────────────────────────────────────────────────────┐
│ Order #fed62f9b                                     │
│ [Completed] ← Gray badge                           │
│                                                     │
│ 📅 Pickup: February 5, 2026 at 7:30 AM            │
│ 💰 Total: ₹40.00                                   │
│                                                     │
│ Items:                                             │
│ • Idli Sambar x2                                   │
│                                                     │
│ [👁 View Details]  ← Only this button             │
│                     ← NO cancel button (correct!)  │
└─────────────────────────────────────────────────────┘
```

## Summary

### The Button IS Working Correctly! ✅

The cancel button is **intentionally hidden** for orders that cannot be cancelled. This is the correct behavior per the requirements.

### What You Need to Do

1. **Look for the NEW test orders** (pickup times 18:00 and 19:00)
2. **These orders WILL have the cancel button**
3. **Old orders (07:30 pickup) will NOT have the button** (this is correct!)

### Key Points

- ✅ Cancel button code is implemented correctly
- ✅ Button visibility logic is working as designed
- ✅ Test orders with future pickup times have been created
- ✅ You should now be able to see and test the cancel button
- ✅ The enhanced dialog with refund breakdown will appear when you click it

## Still Having Issues?

If after following all these steps you still don't see the cancel button on the test orders (18:00 and 19:00 pickup times), please:

1. Take a screenshot of your Order History page
2. Check the browser console for errors (F12 → Console tab)
3. Verify the current time on your system
4. Confirm you're logged in as the correct user
5. Try refreshing the page (F5)

The button should definitely be visible on orders with future pickup times!
