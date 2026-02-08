# Testing the Cancel Order Feature

## Test Orders Created

I've created several test orders with **future pickup times** so you can test the cancel functionality:

### Order 1: Pending Status (Full Refund)
- **Order ID**: 8b8e7902-9c56-4f41-a067-deac35c365dc
- **Status**: Pending (Not Yet Started Preparing)
- **Pickup Time**: 18:00 (6:00 PM today)
- **Amount**: ₹40.00
- **Expected Refund**: 100% (₹40.00)
- **Dialog Theme**: Green (Success)

### Order 2: Preparing Status (Partial Refund)
- **Order ID**: 8955eca5-b021-4fdf-ae54-1ee1279422f1
- **Status**: Preparing (Preparation Started)
- **Pickup Time**: 19:00 (7:00 PM today)
- **Amount**: ₹50.00
- **Expected Refund**: 50% (₹25.00)
- **Dialog Theme**: Yellow (Warning)

## How to Test

### Step 1: Navigate to Order History
1. Go to the application
2. Click on **"Orders"** in the navigation menu
3. You should see your order list

### Step 2: Find Test Orders
Look for orders with pickup times at:
- 18:00 (6:00 PM) - Pending status
- 19:00 (7:00 PM) - Preparing status

### Step 3: Test Full Refund (Pending Order)
1. Find the order with **"Not Yet Started Preparing"** status (green badge)
2. You should see a **"Cancel Order"** button (red button with X icon)
3. Click the button
4. A dialog will appear with:
   - ✓ Green success theme
   - CheckCircle icon
   - "Order Not Yet Started Preparing" message
   - Full refund breakdown (100%)
   - Explanation text
5. Click **"Yes, Cancel Order"**
6. Success toast should appear with refund amount
7. Order status changes to "Cancelled"

### Step 4: Test Partial Refund (Preparing Order)
1. Find the order with **"Preparation Started"** status (blue badge)
2. You should see:
   - **"Cancel Order"** button
   - Alert message: "50% refund if cancelled now"
3. Click the cancel button
4. A dialog will appear with:
   - ⚠️ Yellow warning theme
   - AlertTriangle icon
   - "Preparation Started - Partial Refund" title
   - Warning box explaining partial refund
   - Complete breakdown:
     * Order Amount: ₹50.00
     * Refund Amount: ₹25.00 (50%)
     * Retained Amount: ₹25.00
   - Explanation of retention reason
5. Click **"Yes, Cancel Order"**
6. Success toast should appear with refund amount
7. Order status changes to "Cancelled"

## Why Old Orders Don't Show Cancel Button

The older orders in your system have pickup times in the past (07:30 AM), which means:
- The 2-hour cancellation window has passed
- The `canCancelOrder` function returns `false`
- The cancel button is hidden (as intended)

This is correct behavior - you can't cancel orders that are past their pickup time.

## Troubleshooting

### If Cancel Button Still Doesn't Appear

1. **Check Current Time**: Make sure the current time is before 16:00 (4:00 PM)
   - Orders with 18:00 pickup need 2 hours buffer
   - If it's past 16:00, the 18:00 order won't be cancellable

2. **Refresh the Page**: Make sure the order list is loaded with the new test orders

3. **Check Order Status**: Only these statuses show cancel button:
   - ✅ pending
   - ✅ confirmed
   - ✅ preparing
   - ❌ ready (cannot cancel)
   - ❌ completed (cannot cancel)
   - ❌ cancelled (already cancelled)

4. **Check Browser Console**: Look for any JavaScript errors

### Create More Test Orders

If you need orders with even later pickup times, you can create them via SQL:

```sql
-- Create order with 22:00 (10 PM) pickup time
WITH user_data AS (
  SELECT id FROM profiles LIMIT 1
),
menu_item AS (
  SELECT id, price FROM menu_items LIMIT 1
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
    menu_item.price,
    'pending',
    CURRENT_DATE,
    '22:00:00'::time,
    '22:00-22:30',
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
  1,
  menu_item.price
FROM new_order, menu_item
RETURNING order_id;
```

## Expected Behavior Summary

### Cancel Button Visibility Rules

| Order Status | Pickup Time | Cancel Button |
|-------------|-------------|---------------|
| Pending | Future (>2h) | ✅ Visible |
| Pending | Future (<2h) | ❌ Hidden |
| Pending | Past | ❌ Hidden |
| Preparing | Future (>2h) | ✅ Visible |
| Preparing | Future (<2h) | ❌ Hidden |
| Ready | Any | ❌ Hidden |
| Completed | Any | ❌ Hidden |
| Cancelled | Any | ❌ Hidden |

### Dialog Appearance

| Order Status | Dialog Theme | Refund | Icon |
|-------------|-------------|--------|------|
| Pending | Green (Success) | 100% | ✓ CheckCircle |
| Confirmed | Green (Success) | 100% | ✓ CheckCircle |
| Preparing | Yellow (Warning) | 50% | ⚠️ AlertTriangle |
| Ready | N/A (No button) | N/A | N/A |

## Quick Verification Checklist

- [ ] Navigate to Order History page
- [ ] See orders with future pickup times (18:00, 19:00)
- [ ] See "Cancel Order" button on pending order
- [ ] See "Cancel Order" button on preparing order
- [ ] Click cancel on pending order → Green dialog appears
- [ ] Dialog shows 100% refund breakdown
- [ ] Confirm cancellation → Success toast appears
- [ ] Order status changes to "Cancelled"
- [ ] Click cancel on preparing order → Yellow dialog appears
- [ ] Dialog shows 50% refund breakdown with warning
- [ ] Dialog explains retention reason
- [ ] Confirm cancellation → Success toast with refund amount
- [ ] Order status changes to "Cancelled"

## Notes

- The cancel button is **intentionally hidden** for orders that can't be cancelled
- This is correct behavior per the requirements
- The test orders I created have future pickup times specifically so you can test the feature
- If you're testing late in the day, you may need to create orders with tomorrow's date

## Need More Help?

If the button still doesn't appear after checking all the above:
1. Check the browser console for errors
2. Verify you're logged in as the user who owns the orders
3. Make sure the page has fully loaded
4. Try refreshing the page
5. Check that the current time is at least 2 hours before the pickup time
