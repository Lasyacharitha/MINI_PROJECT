# Task: Pickup Slot Management System

## Requirements
- Each pickup time slot has a maximum capacity (e.g., 10 orders per slot)
- When order is placed, reduce available slots by 1
- Prevent slots from going below 0
- Mark slots as "Fully Booked" when capacity reaches 0
- Real-time updates for all users
- When order is cancelled, increase slot count by 1 (not exceeding max)

## Plan
- [x] Create TODO file and plan implementation
- [x] Database Schema
  - [x] Create pickup_slots table
  - [x] Add indexes for performance
  - [x] Create function to check slot availability
  - [x] Create function to book a slot
  - [x] Create function to release a slot
  - [x] Add trigger on orders table to manage slots
- [x] Backend Logic
  - [x] RLS policies for pickup_slots table
  - [x] Seed initial slot data
  - [x] Update order placement to check slot availability
- [x] Frontend Updates
  - [x] Update order placement UI to show slot availability
  - [x] Add real-time subscription for slot updates
  - [x] Show "Fully Booked" indicator
  - [x] Prevent selection of fully booked slots
- [x] Admin Interface
  - [x] Create Slot Management page
  - [x] Allow admins to set max capacity per slot
  - [x] View current bookings per slot
  - [x] Manually adjust slot availability
- [x] Documentation
  - [x] Comprehensive guide created
  - [x] Quick reference card created
  - [x] API documentation included

## Implementation Complete ✅

All features have been successfully implemented:

### Database Layer
- ✅ pickup_slots table with proper constraints
- ✅ Atomic booking/release functions
- ✅ Automatic triggers on order insert/update
- ✅ RLS policies for security
- ✅ Initial seed data for 7 days

### Backend API
- ✅ getPickupSlots() - Fetch slots by date
- ✅ checkSlotAvailability() - Check specific slot
- ✅ createPickupSlot() - Admin create new slot
- ✅ updateSlotCapacity() - Admin adjust capacity
- ✅ deletePickupSlot() - Admin remove slot
- ✅ getAllPickupSlots() - Admin view all slots

### Frontend - Customer
- ✅ Checkout page shows slot availability
- ✅ Real-time updates via Supabase Realtime
- ✅ Color-coded badges (Available/Low/Fully Booked)
- ✅ Disabled selection for fully booked slots
- ✅ Final availability check before order placement
- ✅ Error handling for unavailable slots

### Frontend - Admin
- ✅ Slot Management page (/admin/slots)
- ✅ Summary cards with statistics
- ✅ Slots grouped by date
- ✅ Create new slots dialog
- ✅ Inline capacity editing
- ✅ Delete slots (only if no bookings)
- ✅ Real-time monitoring
- ✅ Utilization progress bars
- ✅ Added to admin sidebar navigation

### Documentation
- ✅ SLOT_MANAGEMENT_GUIDE.md - Complete technical guide
- ✅ SLOT_MANAGEMENT_QUICK_REFERENCE.md - Quick reference card
- ✅ Includes user guides, admin guides, troubleshooting
- ✅ API reference and testing scenarios

## Testing Checklist

To verify the system works correctly:

1. **Test Slot Booking**
   - Place an order and verify slot count decreases
   - Check database: current_bookings incremented
   - Verify other users see updated count

2. **Test Slot Release**
   - Cancel an order and verify slot count increases
   - Check database: current_bookings decremented
   - Verify slot becomes available again

3. **Test Fully Booked**
   - Set slot capacity to 2
   - Place 2 orders
   - Verify slot shows "Fully Booked"
   - Verify cannot select that slot
   - Verify order placement fails if attempted

4. **Test Real-Time Updates**
   - Open checkout in two browsers
   - Book slot in browser 1
   - Verify browser 2 updates immediately

5. **Test Admin Functions**
   - Create new slot
   - Update capacity
   - Delete empty slot
   - Verify cannot delete slot with bookings

6. **Test Edge Cases**
   - Concurrent bookings (two users, last slot)
   - Capacity adjustment with active bookings
   - Order placement with expired slot selection

## Notes
- All database operations are atomic and thread-safe
- Real-time updates work without polling
- System prevents overbooking at database level
- Admin cannot reduce capacity below current bookings
- Slots can only be deleted if no active bookings
- Default capacity is 10 orders per slot
- Slots auto-created on first booking if not exist
