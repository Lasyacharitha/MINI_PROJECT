# Quick Reference: Three-Tier Refund Policy

## Refund Rules

| Order Status | Refund % | Amount Example | User Gets |
|-------------|----------|----------------|-----------|
| **Pending** | 100% | ₹60 order | ₹60 back |
| **Preparing** | 50% | ₹80 order | ₹40 back |
| **Ready** | 0% | ₹100 order | ₹0 back |

## Visual Indicators

### Pending Order
```
Status Badge: [Not Yet Started Preparing] (Green)
Alert: None
Cancel Button: ✅ Visible
Dialog: Green with ✓ icon
Message: "Full refund will be processed"
```

### Preparing Order
```
Status Badge: [Preparation Started] (Blue)
Alert: "50% refund if cancelled now" (Yellow)
Cancel Button: ✅ Visible
Dialog: Yellow with ⚠️ icon
Message: "50% refund as preparation has started"
```

### Ready Order
```
Status Badge: [Ready for Pickup] (Green)
Alert: "No refund available - order is ready" (Red)
Cancel Button: ✅ Visible
Dialog: Red with ❌ icon
Message: "No refund available as order is ready"
```

## Test Orders Available

### Order 1: Pending (100% Refund)
- **ID**: bc7ac8e3-e160-41f8-a6be-5e145af1d624
- **Pickup**: 22:00 (10:00 PM)
- **Amount**: ₹60.00
- **Refund**: ₹60.00

### Order 2: Preparing (50% Refund)
- **ID**: cd8c7ebb-e696-4c51-b735-3cc062af8a74
- **Pickup**: 22:30 (10:30 PM)
- **Amount**: ₹80.00
- **Refund**: ₹40.00

### Order 3: Ready (0% Refund)
- **ID**: 64184af5-aeb5-48a3-9cd5-1de157288720
- **Pickup**: 23:00 (11:00 PM)
- **Amount**: ₹100.00
- **Refund**: ₹0.00

## How to Test

1. **Go to Order History** (`/orders`)
2. **Find test orders** (pickup times: 22:00, 22:30, 23:00)
3. **Click "Cancel Order"** on each
4. **Observe different dialogs**:
   - Pending: Green dialog, 100% refund
   - Preparing: Yellow dialog, 50% refund
   - Ready: Red dialog, 0% refund
5. **Confirm cancellation**
6. **See success message** with refund amount

## What Happens Automatically

✅ System checks order status
✅ System calculates refund percentage
✅ System shows appropriate dialog
✅ System updates order on confirmation
✅ System records refund amount
✅ System sets refund status
✅ System saves cancellation timestamp

**No manual calculation needed!**

## Key Points

- **Automatic**: Refund calculated by system
- **Status-Based**: Different refund for each status
- **Transparent**: User sees breakdown before confirming
- **Auditable**: All cancellations tracked
- **Fair**: Covers costs based on preparation stage

## Quick Test Checklist

- [ ] Pending order shows green dialog with 100% refund
- [ ] Preparing order shows yellow dialog with 50% refund
- [ ] Ready order shows red dialog with 0% refund
- [ ] Each dialog shows correct refund amount
- [ ] Success toast displays refund amount
- [ ] Order status changes to "Cancelled"
- [ ] Refund amount is recorded in database

## Need Help?

See detailed documentation in:
- `THREE_TIER_REFUND_POLICY.md` - Complete implementation guide
- `CANCEL_BUTTON_TROUBLESHOOTING.md` - If button not visible
- `USER_GUIDE_ORDER_CANCELLATION.md` - User-facing guide
