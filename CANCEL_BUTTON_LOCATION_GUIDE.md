# How to Find and Use the Cancel Order Button

## Issue Resolved ✅

The previous test orders had **past pickup times** (from yesterday), which is why the cancel button wasn't showing. I've now created **new test orders for today** with future pickup times.

## New Test Orders Created (February 6, 2026)

### Order 1: Pending Status (100% Refund)
```
Order ID: 0d80f541-97ce-4f91-b047-0ca11a574cb9
Status: Pending (Not Yet Started Preparing)
Pickup Time: 18:00 (6:00 PM today)
Amount: ₹60.00
Expected Refund: ₹60.00 (100%)
Cancel Button: ✅ WILL BE VISIBLE
```

### Order 2: Preparing Status (50% Refund)
```
Order ID: 899439a4-61a0-483d-a07a-bfa5c2a0b55a
Status: Preparing (Preparation Started)
Pickup Time: 19:00 (7:00 PM today)
Amount: ₹80.00
Expected Refund: ₹40.00 (50%)
Cancel Button: ✅ WILL BE VISIBLE
```

### Order 3: Ready Status (0% Refund)
```
Order ID: f39f7188-22ba-4919-a709-39881bb92654
Status: Ready for Pickup
Pickup Time: 20:00 (8:00 PM today)
Amount: ₹100.00
Expected Refund: ₹0.00 (0%)
Cancel Button: ✅ WILL BE VISIBLE
```

## Step-by-Step Instructions

### Step 1: Navigate to Order History
1. Open your application
2. Click on **"Orders"** in the navigation menu
3. Or go directly to: `/orders`

### Step 2: Find the New Test Orders
Look for orders with these characteristics:
- **Pickup Date**: February 6, 2026 (today)
- **Pickup Times**: 18:00, 19:00, 20:00
- **Status Badges**: 
  - "Not Yet Started Preparing" (green)
  - "Preparation Started" (blue)
  - "Ready for Pickup" (green)

### Step 3: Locate the Cancel Button
For each order, you should see:

```
┌─────────────────────────────────────────────┐
│ Order #0d80f541                             │
│ [Not Yet Started Preparing] ← Status badge  │
│                                             │
│ 📅 Pickup: February 6, 2026 at 6:00 PM     │
│ 💰 Total: ₹60.00                            │
│                                             │
│ Items: Idli Sambar x3                       │
│                                             │
│ ┌─────────────────┐                        │
│ │ 👁 View Details │ ← Gray button          │
│ └─────────────────┘                        │
│ ┌─────────────────┐                        │
│ │ 🗙 Cancel Order │ ← RED BUTTON (HERE!)   │
│ └─────────────────┘                        │
└─────────────────────────────────────────────┘
```

The **Cancel Order** button is:
- **Color**: Red (destructive style)
- **Icon**: 🗙 (X circle)
- **Location**: Below the "View Details" button
- **Text**: "Cancel Order"

### Step 4: Click Cancel Order
1. Click the red **"Cancel Order"** button
2. A dialog will appear based on the order status:
   - **Pending**: Green dialog with 100% refund info
   - **Preparing**: Yellow dialog with 50% refund warning
   - **Ready**: Red dialog with 0% refund notice

### Step 5: Review and Confirm
1. Read the refund information in the dialog
2. See the refund breakdown:
   - Order Amount
   - Refund Amount
   - Retained Amount (if applicable)
3. Click **"Yes, Cancel Order"** to confirm
4. Or click **"No, Keep Order"** to cancel the action

### Step 6: See the Result
After confirming:
1. Success toast notification appears
2. Shows refund amount
3. Order status changes to "Cancelled"
4. Order list refreshes automatically

## Visual Guide: What You Should See

### Pending Order Card
```
┌──────────────────────────────────────────────────┐
│ Order #0d80f541                                  │
│ [Not Yet Started Preparing] ← Green badge        │
│                                                  │
│ 📅 Pickup: February 6, 2026 at 6:00 PM          │
│ 💰 Total: ₹60.00                                 │
│                                                  │
│ Items:                                           │
│ • Idli Sambar x3                                 │
│                                                  │
│ [👁 View Details]                                │
│ [🗙 Cancel Order] ← This button should be here! │
└──────────────────────────────────────────────────┘
```

### Preparing Order Card
```
┌──────────────────────────────────────────────────┐
│ Order #899439a4                                  │
│ [Preparation Started] ← Blue badge               │
│                                                  │
│ 📅 Pickup: February 6, 2026 at 7:00 PM          │
│ 💰 Total: ₹80.00                                 │
│                                                  │
│ Items:                                           │
│ • Idli Sambar x4                                 │
│                                                  │
│ [👁 View Details]                                │
│ [🗙 Cancel Order] ← This button should be here! │
│                                                  │
│ ⚠️ 50% refund if cancelled now ← Yellow alert   │
└──────────────────────────────────────────────────┘
```

### Ready Order Card
```
┌──────────────────────────────────────────────────┐
│ Order #f39f7188                                  │
│ [Ready for Pickup] ← Green badge                 │
│                                                  │
│ 📅 Pickup: February 6, 2026 at 8:00 PM          │
│ 💰 Total: ₹100.00                                │
│                                                  │
│ Items:                                           │
│ • Idli Sambar x5                                 │
│                                                  │
│ [👁 View Details]                                │
│ [🗙 Cancel Order] ← This button should be here! │
│                                                  │
│ ❌ No refund available - order is ready ← Red   │
└──────────────────────────────────────────────────┘
```

## Troubleshooting

### If You Still Don't See the Cancel Button

#### Check 1: Are You Looking at the Right Orders?
- **Correct**: Orders with pickup times 18:00, 19:00, 20:00 **today**
- **Wrong**: Orders with past dates or times

#### Check 2: Refresh the Page
- Press **F5** or **Ctrl+R** (Cmd+R on Mac)
- Make sure the page fully loads
- Check if the new orders appear

#### Check 3: Verify You're Logged In
- The orders must belong to your user account
- If you see the orders in the list, you're logged in correctly

#### Check 4: Check Browser Console
- Press **F12** to open Developer Tools
- Go to **Console** tab
- Look for any error messages
- Share any errors you see

#### Check 5: Scroll Down
- Make sure you scroll through the entire order list
- The new orders should be at the top (most recent)

### If Orders Are Not Showing At All

1. **Refresh the page** (F5)
2. **Check you're on the Order History page** (`/orders`)
3. **Verify you're logged in** (check if you see your profile)
4. **Check the date filter** (if any) - make sure it includes today

## Why the Previous Orders Didn't Work

The test orders I created earlier had these pickup times:
- **February 5, 2026** at 22:00, 22:30, 23:00

But today is **February 6, 2026** at 12:32 PM, so those times have passed.

The system correctly hides the cancel button for orders that:
- ❌ Have pickup times in the past
- ❌ Are within 1 hour of pickup time
- ❌ Are already completed or cancelled

This is the **correct behavior** per the requirements!

## Current Status

✅ **New orders created** with future pickup times
✅ **Cancel button will show** (verified: 5+ hours until pickup)
✅ **All three refund scenarios** ready to test
✅ **Orders belong to your user** account

## Quick Test Checklist

- [ ] Go to Order History page (`/orders`)
- [ ] See three new orders with today's date
- [ ] See pickup times: 18:00, 19:00, 20:00
- [ ] See red "Cancel Order" button on each order
- [ ] Click cancel on pending order → Green dialog
- [ ] Click cancel on preparing order → Yellow dialog
- [ ] Click cancel on ready order → Red dialog
- [ ] Confirm cancellation → Success toast
- [ ] Order status changes to "Cancelled"

## Need More Help?

If you still don't see the cancel button after following these steps:

1. **Take a screenshot** of your Order History page
2. **Check the browser console** for errors (F12 → Console)
3. **Verify the current time** on your system
4. **Confirm you're logged in** as the correct user

The cancel button **should definitely be visible** on these new test orders!

---

**Summary**: The issue was that the old test orders had past pickup times. The new orders created above have future pickup times (18:00, 19:00, 20:00 today), so the cancel button will now be visible. Simply refresh your Order History page and look for orders with today's date!
