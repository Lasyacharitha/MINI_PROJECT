# Pickup Slot Management - Quick Reference

## For Customers

### How to Check Slot Availability
1. Add items to cart
2. Go to Checkout
3. View "Pickup Time Slot" dropdown
4. Each slot shows availability status:
   - 🟢 **Available** - Plenty of slots left
   - 🟡 **Low** - Only 1-3 slots remaining
   - 🔴 **Fully Booked** - No slots available

### How to Book a Slot
1. Select an available time slot
2. Complete order details
3. Click "Place Order"
4. Slot is automatically booked
5. You'll receive order confirmation

### What Happens When You Cancel
- Your slot is automatically released
- Other customers can book it
- Refund processed according to policy

### Real-Time Updates
- Slot availability updates automatically
- No need to refresh the page
- See live booking status

## For Admins

### Quick Actions

**View All Slots**
- Admin Dashboard → Pickup Slots

**Create New Slot**
- Click "Add Slot"
- Select date, time, capacity
- Click "Create Slot"

**Adjust Capacity**
- Find slot in table
- Edit capacity number
- Press Enter

**Monitor Status**
- View summary cards for overview
- Check utilization bars
- Watch real-time updates

### Slot Status Indicators

| Status | Meaning | Action |
|--------|---------|--------|
| Available | Slots remaining | No action needed |
| 80%+ Full | Nearly full | Consider adding capacity |
| Fully Booked | No slots left | Add more slots or increase capacity |

### Best Practices
✅ Set realistic capacities based on kitchen capacity
✅ Create slots in advance for upcoming days
✅ Monitor peak hours and adjust accordingly
✅ Review utilization regularly

❌ Don't delete slots with active bookings
❌ Don't reduce capacity below current bookings
❌ Don't forget to create slots for new days

## System Behavior

### Automatic Actions
- ✅ Slot booked when order placed
- ✅ Slot released when order cancelled
- ✅ Real-time updates to all users
- ✅ Prevents overbooking
- ✅ Thread-safe for concurrent bookings

### Capacity Rules
- Default capacity: 10 orders per slot
- Minimum capacity: 1
- Cannot reduce below current bookings
- Can increase anytime

### Booking Rules
- Orders only for current date
- Must select available slot
- Cannot book fully booked slots
- Final availability check at order placement

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Slot fully booked" error | Select different time slot |
| Cannot reduce capacity | Wait for orders to complete |
| Real-time not updating | Refresh page |
| Cannot delete slot | Slot has active bookings |

## Contact
For technical support, contact system administrator.

---
**Version**: 1.0 | **Last Updated**: 2026-02-05
