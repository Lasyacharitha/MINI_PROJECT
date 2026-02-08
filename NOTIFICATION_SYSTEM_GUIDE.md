# In-App Notification System Guide

## Overview
The SRIT Canteen application includes a comprehensive in-app notification system that alerts customers about order status changes in real-time.

## Features

### 1. Notification Bell Icon
- Located in the header next to the shopping cart
- Shows a red badge with unread notification count
- Displays "9+" if more than 9 unread notifications
- Only visible to logged-in users

### 2. Real-Time Updates
- Notifications appear instantly when order status changes
- Uses Supabase Realtime for live updates
- No page refresh required

### 3. Notification Dropdown
Click the bell icon to see:
- Last 10 notifications
- Unread notifications highlighted with accent background
- Blue dot indicator for unread items
- Time since notification (e.g., "2 minutes ago")
- "Mark all as read" button

### 4. Notification Types
Currently supports:
- **Order Status Updates**: When admin changes order status
- **Order Confirmation**: When order is placed
- **Order Completion**: When order is picked up
- **Order Cancellation**: When order is cancelled

## When Notifications Are Sent

### Admin Actions
1. **Status Change in Order Management**
   - Admin changes order status (pending → confirmed → preparing → ready → completed)
   - Customer receives instant notification
   - Notification shows new status

2. **Order Pickup**
   - Staff marks order as "Picked Up"
   - Customer receives completion notification

### Customer Actions
1. **Order Cancellation**
   - Customer cancels their order
   - Notification confirms cancellation with refund details

## Notification Content

Each notification includes:
- **Title**: Brief description (e.g., "Order Status Updated")
- **Message**: Detailed information (e.g., "Your order status has been updated to: preparing")
- **Timestamp**: How long ago the notification was sent
- **Read Status**: Visual indicator for unread notifications

## User Experience

### For Customers
1. **Receive Notification**
   - Bell icon shows red badge with count
   - Badge updates in real-time

2. **View Notifications**
   - Click bell icon to open dropdown
   - See all recent notifications
   - Unread notifications are highlighted

3. **Mark as Read**
   - Click individual notification to mark as read
   - Or click "Mark all as read" button
   - Badge count updates automatically

4. **Stay Informed**
   - No need to constantly check order status
   - Get instant updates on order progress
   - Know exactly when to pick up order

### For Admins
When admin updates order status:
1. Order status is updated in database
2. In-app notification is created for customer
3. Admin sees toast confirmation
4. Customer's notification bell updates instantly
5. Email notification is logged (simulation mode)

## Technical Details

### Database Table
Notifications are stored in the `notifications` table:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Real-Time Subscription
The notification dropdown subscribes to database changes:
- Listens for new notifications for the current user
- Automatically updates when new notifications arrive
- No polling required - instant updates

### Notification Creation Points

**1. Order Management Page** (`src/pages/admin/OrderManagement.tsx`)
```typescript
await supabase.from('notifications').insert({
  user_id: currentOrder.user_id,
  title: 'Order Status Updated',
  message: `Your order status has been updated to: ${newStatus}`,
  type: 'order_update',
  is_read: false,
});
```

**2. Order Pickup Page** (`src/pages/admin/OrderPickup.tsx`)
```typescript
await supabase.from('notifications').insert({
  user_id: order.user_id,
  title: 'Order Completed',
  message: 'Your order has been picked up successfully. Thank you!',
  type: 'order_update',
  is_read: false,
});
```

**3. Order Cancellation** (`src/db/api.ts`)
```typescript
await supabase.from('notifications').insert({
  user_id: order.user_id,
  title: 'Order Cancelled',
  message: `Your order has been cancelled. Refund amount: ₹${refundAmount}`,
  type: 'order_update',
  is_read: false,
});
```

## Testing Notifications

### Test Scenario 1: Order Status Change
1. Customer places an order
2. Admin logs in and goes to Order Management
3. Admin changes order status to "confirmed"
4. Customer's notification bell shows badge (1)
5. Customer clicks bell and sees notification
6. Customer clicks notification to mark as read
7. Badge disappears

### Test Scenario 2: Multiple Status Changes
1. Admin changes order through multiple statuses:
   - pending → confirmed
   - confirmed → preparing
   - preparing → ready
2. Customer receives 3 notifications
3. Badge shows (3)
4. Customer can see all notifications in dropdown

### Test Scenario 3: Real-Time Updates
1. Open app in two browser windows
2. Window 1: Customer logged in
3. Window 2: Admin logged in
4. Admin changes order status
5. Customer's window updates instantly (no refresh needed)
6. Notification bell badge appears immediately

### Test Scenario 4: Mark All as Read
1. Customer has 5 unread notifications
2. Badge shows (5)
3. Customer clicks bell icon
4. Customer clicks "Mark all as read"
5. All notifications marked as read
6. Badge disappears
7. Notifications no longer highlighted

## Troubleshooting

### Problem: Notifications Not Appearing

**Possible Causes:**
1. User not logged in
2. Notification not created in database
3. Real-time subscription not working

**Solutions:**
1. Verify user is logged in
2. Check database:
   ```sql
   SELECT * FROM notifications 
   WHERE user_id = 'USER_ID' 
   ORDER BY created_at DESC;
   ```
3. Check browser console for errors
4. Refresh page to re-establish subscription

### Problem: Badge Count Wrong

**Possible Causes:**
1. Notifications marked as read but badge not updated
2. Multiple notifications created for same event

**Solutions:**
1. Click bell icon to refresh count
2. Check database for duplicate notifications
3. Refresh page

### Problem: Real-Time Updates Not Working

**Possible Causes:**
1. Supabase Realtime not enabled
2. Network connection issues
3. Browser blocking WebSocket connections

**Solutions:**
1. Verify Supabase Realtime is enabled in project settings
2. Check network connection
3. Try different browser
4. Check browser console for WebSocket errors

## Best Practices

### For Admins
1. **Update Status Promptly**
   - Change order status as soon as work begins
   - Customers appreciate timely updates

2. **Consistent Status Flow**
   - Follow the standard flow: pending → confirmed → preparing → ready → completed
   - Don't skip statuses unless necessary

3. **Monitor Notifications**
   - Ensure customers are receiving notifications
   - Check if notification system is working properly

### For Developers
1. **Always Create Notifications**
   - Every order status change should create a notification
   - Include clear, descriptive messages

2. **Handle Errors Gracefully**
   - If notification creation fails, log error but don't block order update
   - Notifications are important but not critical

3. **Test Real-Time Updates**
   - Verify Supabase Realtime subscription works
   - Test with multiple users simultaneously

4. **Keep Messages Clear**
   - Use simple, user-friendly language
   - Include relevant order details
   - Avoid technical jargon

## Future Enhancements

Potential improvements:
1. **Notification Preferences**
   - Allow users to choose which notifications to receive
   - Enable/disable specific notification types

2. **Notification History**
   - Dedicated page showing all notifications
   - Filter by type, date, read status

3. **Push Notifications**
   - Browser push notifications when app is closed
   - Requires PWA setup and user permission

4. **Notification Sounds**
   - Optional sound alert for new notifications
   - User can enable/disable in settings

5. **Notification Actions**
   - Quick actions from notification (e.g., "View Order")
   - Direct links to relevant pages

6. **Notification Grouping**
   - Group related notifications together
   - Collapse multiple status updates for same order

## Comparison: In-App vs Email Notifications

| Feature | In-App Notifications | Email Notifications |
|---------|---------------------|---------------------|
| **Speed** | Instant (real-time) | Delayed (simulation mode) |
| **Reliability** | ✅ Always works | ❌ Requires setup |
| **User Experience** | ✅ Seamless | ⚠️ Requires checking email |
| **Setup Required** | ✅ None | ❌ Third-party service |
| **Cost** | ✅ Free | ⚠️ May have costs |
| **Accessibility** | ✅ Always available in app | ⚠️ Requires email access |

## Conclusion

The in-app notification system provides reliable, real-time updates to customers about their order status. It works out of the box without any additional setup and ensures customers stay informed throughout the order lifecycle. While email notifications are in simulation mode, in-app notifications provide a complete and functional notification solution.

For production use, we recommend:
1. **Keep in-app notifications** as the primary notification method
2. **Add email notifications** as a secondary channel (see EMAIL_SETUP_GUIDE.md)
3. **Consider push notifications** for enhanced user engagement

The current in-app notification system is production-ready and provides excellent user experience without requiring any external services or additional configuration.
