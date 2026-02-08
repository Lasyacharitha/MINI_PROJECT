# Pickup Slot Management System Guide

## Overview
The Pickup Slot Management System ensures efficient order scheduling by limiting the number of orders that can be placed for each pickup time slot. This prevents overcrowding at the canteen and ensures smooth order fulfillment.

## Features

### 1. Slot Capacity Management
- Each time slot has a configurable maximum capacity (default: 10 orders)
- Slots automatically track current bookings
- System prevents overbooking by checking availability before accepting orders

### 2. Real-Time Availability Updates
- All users see live slot availability without page refresh
- Uses Supabase Realtime for instant updates
- Availability updates when:
  - New orders are placed
  - Orders are cancelled
  - Admin changes slot capacity

### 3. Automatic Slot Booking
- When a user places an order, the system automatically:
  - Checks if the selected slot is available
  - Books the slot (decrements available count)
  - Prevents booking if slot is fully booked
  - Shows error if slot becomes unavailable during checkout

### 4. Automatic Slot Release
- When an order is cancelled, the system automatically:
  - Releases the slot (increments available count)
  - Makes the slot available for other users
  - Never exceeds the maximum capacity

### 5. Visual Indicators
- **Available**: Green badge with available slots count
- **Low Availability** (≤3 slots): Yellow badge showing urgency
- **Fully Booked**: Red badge, slot disabled for selection
- Progress bar showing utilization percentage

## User Experience

### For Customers

#### Viewing Slot Availability
1. Navigate to Checkout page after adding items to cart
2. Select "Pickup Time Slot" dropdown
3. Each slot shows:
   - Time (e.g., "09:00 AM")
   - Available slots count (e.g., "7/10 available")
   - Status badge (Available/Low/Fully Booked)

#### Placing an Order
1. Select an available time slot
2. Selected slot shows confirmation badge below dropdown
3. Complete payment and order details
4. Click "Place Order"
5. System checks slot availability one final time
6. If available: Order confirmed, slot booked
7. If unavailable: Error shown, select different slot

#### Real-Time Updates
- If another user books the last slot while you're on checkout:
  - Slot automatically updates to "Fully Booked"
  - You'll see the change without refreshing
  - System prevents you from booking unavailable slot

### For Admins

#### Accessing Slot Management
1. Login as admin
2. Navigate to Admin Dashboard
3. Click "Pickup Slots" in sidebar
4. View all slots for next 7 days

#### Managing Slots

**View Slot Status**
- Summary cards show:
  - Total slots
  - Available slots
  - Fully booked slots
  - Total bookings
- Slots grouped by date
- Each slot shows:
  - Time
  - Current bookings
  - Max capacity
  - Utilization percentage
  - Status badge

**Create New Slot**
1. Click "Add Slot" button
2. Select date (today or future)
3. Enter time (e.g., "14:00")
4. Set max capacity (default: 10)
5. Click "Create Slot"

**Update Slot Capacity**
1. Find the slot in the table
2. Edit the capacity number directly
3. Press Enter or click outside
4. Capacity updates immediately
5. Note: Cannot reduce below current bookings

**Delete Slot**
1. Click trash icon next to slot
2. Confirm deletion
3. Note: Can only delete slots with 0 bookings

**Real-Time Monitoring**
- Slot status updates automatically as orders come in
- Utilization bars show live booking progress
- No need to refresh page

## Technical Implementation

### Database Schema

**pickup_slots table**
```sql
- id: UUID (primary key)
- date: DATE (pickup date)
- time_slot: TIME (pickup time)
- max_capacity: INTEGER (maximum orders)
- current_bookings: INTEGER (current order count)
- is_available: BOOLEAN (computed: current < max)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Database Functions

**book_pickup_slot(date, time)**
- Atomically increments booking count
- Creates slot if doesn't exist
- Returns false if slot is full
- Thread-safe for concurrent bookings

**release_pickup_slot(date, time)**
- Atomically decrements booking count
- Never goes below 0
- Returns false if slot doesn't exist

**check_slot_availability(date, time)**
- Returns available slots count
- Returns max capacity
- Returns availability status

### Database Triggers

**trigger_manage_order_slot**
- Fires on INSERT: Books slot automatically
- Fires on UPDATE (to cancelled): Releases slot automatically
- Ensures data consistency
- Prevents manual slot manipulation

### Security

**Row Level Security (RLS)**
- Everyone can view slot availability
- Only admins can create/update/delete slots
- Booking/releasing handled by database functions
- No direct user manipulation of slot counts

## Testing Scenarios

### Test 1: Normal Booking Flow
1. Customer selects available slot
2. Places order
3. Slot count decreases by 1
4. Other users see updated count immediately

### Test 2: Fully Booked Slot
1. Admin sets slot capacity to 5
2. 5 customers place orders
3. Slot shows "Fully Booked"
4. 6th customer cannot select that slot
5. Order placement fails if attempted

### Test 3: Order Cancellation
1. Customer places order (slot: 7/10)
2. Customer cancels order
3. Slot updates to 8/10
4. Slot becomes available again

### Test 4: Concurrent Bookings
1. Two customers select same slot simultaneously
2. Both click "Place Order" at same time
3. Database function handles atomically
4. First succeeds, second succeeds if slots available
5. If last slot: First succeeds, second fails with error

### Test 5: Real-Time Updates
1. Open checkout on two browsers
2. Book slot in browser 1
3. Browser 2 sees count decrease immediately
4. No page refresh needed

### Test 6: Capacity Adjustment
1. Admin increases capacity from 10 to 15
2. Fully booked slot becomes available
3. Customers can now book
4. Admin decreases capacity from 15 to 12
5. If current bookings = 13, cannot reduce below 13

## Best Practices

### For Admins
1. **Set Realistic Capacities**: Consider kitchen capacity and pickup counter space
2. **Monitor Peak Hours**: Adjust capacity for busy times (lunch, dinner)
3. **Plan Ahead**: Create slots for upcoming days in advance
4. **Regular Monitoring**: Check utilization to optimize capacity
5. **Don't Delete Active Slots**: Only delete slots with 0 bookings

### For System Maintenance
1. **Database Backups**: Regular backups of pickup_slots table
2. **Monitor Performance**: Check query performance on high-traffic days
3. **Audit Logs**: Review slot changes and booking patterns
4. **Capacity Planning**: Analyze historical data to set optimal capacities

## Troubleshooting

### Issue: Slot shows available but order fails
**Cause**: Another user booked the last slot between viewing and ordering
**Solution**: Select a different time slot, system is working correctly

### Issue: Cannot reduce slot capacity
**Cause**: Current bookings exceed desired capacity
**Solution**: Wait for orders to be completed/cancelled, or increase capacity

### Issue: Slot count seems incorrect
**Cause**: Cancelled orders not releasing slots
**Solution**: Check database trigger is active, verify order status updates

### Issue: Real-time updates not working
**Cause**: Supabase Realtime connection issue
**Solution**: Refresh page, check network connection, verify Supabase status

### Issue: Cannot delete slot
**Cause**: Slot has active bookings
**Solution**: Wait for all orders to be completed, or cancel orders first

## Future Enhancements

Potential improvements for the system:
1. **Waiting List**: Allow users to join waitlist for fully booked slots
2. **Dynamic Pricing**: Adjust prices based on slot demand
3. **Slot Recommendations**: Suggest less busy times to users
4. **Bulk Slot Creation**: Create multiple slots at once
5. **Slot Templates**: Save and reuse slot configurations
6. **Historical Analytics**: Track booking patterns over time
7. **Email Notifications**: Alert users when slots become available
8. **Mobile App Integration**: Push notifications for slot availability

## API Reference

### Frontend API Functions

```typescript
// Get all slots for a specific date
getPickupSlots(date: string): Promise<PickupSlot[]>

// Check availability for a specific slot
checkSlotAvailability(date: string, timeSlot: string): Promise<SlotAvailability>

// Create a new slot (admin only)
createPickupSlot(date: string, timeSlot: string, maxCapacity: number): Promise<PickupSlot>

// Update slot capacity (admin only)
updateSlotCapacity(slotId: string, maxCapacity: number): Promise<PickupSlot>

// Delete a slot (admin only)
deletePickupSlot(slotId: string): Promise<boolean>

// Get all slots within date range (admin only)
getAllPickupSlots(startDate?: string, endDate?: string): Promise<PickupSlot[]>
```

### Database Functions

```sql
-- Book a slot (called automatically by trigger)
book_pickup_slot(p_date DATE, p_time_slot TIME) RETURNS BOOLEAN

-- Release a slot (called automatically by trigger)
release_pickup_slot(p_date DATE, p_time_slot TIME) RETURNS BOOLEAN

-- Check slot availability (called by frontend)
check_slot_availability(p_date DATE, p_time_slot TIME) 
  RETURNS TABLE(available_slots INT, max_capacity INT, is_available BOOLEAN)
```

## Support

For technical issues or questions:
1. Check this guide first
2. Review database logs for errors
3. Check Supabase dashboard for real-time connection status
4. Contact system administrator

---

**Last Updated**: 2026-02-05
**Version**: 1.0
