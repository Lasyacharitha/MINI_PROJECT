# Email Notification Testing Guide

## Overview
This guide helps you verify that email notifications are being sent to the correct customer email addresses when order status changes.

## How Email Addresses Are Determined

### Email Source
When a customer places an order:
1. The order is linked to their user account via `user_id`
2. The user's email is stored in the `profiles` table
3. When status changes, the system:
   - Fetches the order details
   - Looks up the user's profile using `user_id`
   - Retrieves the email address from `profiles.email`
   - Sends the notification to that email address

### Email Flow Diagram
```
Order Status Change
    ↓
Get Order Details (order_id)
    ↓
Get User ID (order.user_id)
    ↓
Get User Profile (profiles.email)
    ↓
Send Email to profiles.email
```

## Testing Email Delivery

### Step 1: Verify User Email in Database
Before testing, check what email address is registered:

```sql
-- Check user's email address
SELECT 
  o.id as order_id,
  p.email as customer_email,
  o.status as order_status
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE o.id = 'YOUR_ORDER_ID';
```

### Step 2: Update Order Status
1. Log in as admin
2. Go to Order Management
3. Find an order
4. Change the status (e.g., from "pending" to "confirmed")
5. Watch for the toast notification

### Step 3: Verify Email Sent
Check the toast message:
- **Success**: "Email sent to [email@srit.ac.in] about the [status] status"
- **Failure**: "Order status changed to [status]. Email notification will be sent to customer's registered email address."

### Step 4: Check Email Inbox
1. Log in to the customer's email account (the one shown in the toast)
2. Check inbox for email from SRIT Canteen
3. Subject line should be: "[Status] - SRIT Canteen"
   - Example: "Order Confirmed - SRIT Canteen"
4. Email should contain:
   - Customer's order details
   - Items ordered
   - Pickup time
   - Status-specific message

### Step 5: Verify Email Logs
Check the browser console for detailed logs:

**Success Log:**
```
Sending order status email to: customer@srit.ac.in
Order ID: abc123..., New Status: confirmed
✅ Email sent successfully to: customer@srit.ac.in
Subject: Order Confirmed - SRIT Canteen
```

**Error Log:**
```
Sending order status email to: customer@srit.ac.in
Order ID: abc123..., New Status: confirmed
Email send error: [error details]
Failed to send email to: customer@srit.ac.in
```

## Common Test Scenarios

### Scenario 1: Single Customer Order
**Setup:**
- Customer A (email: alice@srit.ac.in) places an order
- Admin changes status to "confirmed"

**Expected Result:**
- Email sent to: alice@srit.ac.in
- Toast shows: "Email sent to alice@srit.ac.in about the confirmed status"

### Scenario 2: Multiple Orders from Same Customer
**Setup:**
- Customer B (email: bob@srit.ac.in) places 3 orders
- Admin changes status of Order 1 to "preparing"
- Admin changes status of Order 2 to "ready"

**Expected Result:**
- Order 1: Email sent to bob@srit.ac.in (subject: "Order Being Prepared")
- Order 2: Email sent to bob@srit.ac.in (subject: "Order Ready for Pickup")
- Bob receives 2 separate emails

### Scenario 3: Different Customers
**Setup:**
- Customer C (email: charlie@srit.ac.in) places Order 1
- Customer D (email: diana@srit.ac.in) places Order 2
- Admin changes both to "confirmed"

**Expected Result:**
- Order 1: Email sent to charlie@srit.ac.in
- Order 2: Email sent to diana@srit.ac.in
- Each customer receives only their own order notification

### Scenario 4: Order Cancellation
**Setup:**
- Customer E (email: eve@srit.ac.in) places an order
- Customer E cancels the order from Order History

**Expected Result:**
- Email sent to: eve@srit.ac.in
- Subject: "Order Cancelled - SRIT Canteen"
- Email includes refund information

### Scenario 5: Order Pickup
**Setup:**
- Customer F (email: frank@srit.ac.in) places an order
- Staff scans QR code and marks as "Picked Up"

**Expected Result:**
- Email sent to: frank@srit.ac.in
- Subject: "Order Completed - SRIT Canteen"
- Email confirms successful pickup

## Verifying Email Content

### Check Email Headers
When you receive the email, verify:
- **To:** Should match the customer's registered email
- **From:** Supabase email service
- **Subject:** Should include status and "SRIT Canteen"

### Check Email Body
Verify the email contains:
1. **Header**: SRIT Canteen logo and "Order Status Update"
2. **Status Badge**: Colored badge showing new status
3. **Status Message**: Clear explanation of what the status means
4. **Order Details**:
   - Order ID (first 8 characters)
   - Pickup date and time
   - List of items with quantities and prices
   - Special instructions (if any)
   - Total amount
5. **Footer**: "SRIT Canteen Pre-order System" and "This is an automated email"

## Troubleshooting

### Problem: Wrong Email Address
**Symptoms:**
- Email sent to incorrect address
- Customer not receiving emails

**Diagnosis:**
```sql
-- Check what email is in the database
SELECT email FROM profiles WHERE id = (
  SELECT user_id FROM orders WHERE id = 'ORDER_ID'
);
```

**Solution:**
- Verify the email in the profiles table is correct
- If wrong, update it:
```sql
UPDATE profiles 
SET email = 'correct@srit.ac.in' 
WHERE id = 'USER_ID';
```

### Problem: No Email Received
**Symptoms:**
- Toast shows success but no email in inbox
- Console shows "Email sent successfully"

**Possible Causes:**
1. Email in spam folder
2. Email address typo in database
3. Supabase email service delay
4. Email verification required

**Solutions:**
1. Check spam/junk folder
2. Verify email address spelling in database
3. Wait 1-2 minutes for delivery
4. Check if email needs verification in Supabase

### Problem: Email Error in Console
**Symptoms:**
- Console shows "Email send error"
- Toast shows fallback message

**Possible Causes:**
1. Invalid email format
2. Supabase email service issue
3. Edge Function not deployed
4. Missing environment variables

**Solutions:**
1. Validate email format (must be valid email)
2. Check Supabase dashboard for service status
3. Redeploy Edge Function:
   ```bash
   supabase functions deploy send-order-status-email
   ```
4. Verify environment variables are set

### Problem: Email Shows Wrong Order Details
**Symptoms:**
- Email received but shows different order
- Items don't match

**Diagnosis:**
- Check Edge Function logs in Supabase dashboard
- Verify order_id being passed is correct

**Solution:**
- Check the function call parameters
- Ensure correct order_id is being sent

## Advanced Testing

### Test with Multiple Users
1. Create 3 test accounts with different emails
2. Place orders from each account
3. Update all orders to different statuses
4. Verify each user receives only their emails

### Test All Status Transitions
Test email for each status change:
- pending → confirmed
- confirmed → preparing
- preparing → ready
- ready → completed
- any → cancelled

### Test Edge Cases
1. **Order with no email**: Should fail gracefully
2. **Invalid email format**: Should show error
3. **Rapid status changes**: Should send multiple emails
4. **Concurrent updates**: Each should send separate email

## Email Delivery Checklist

Before marking email system as working, verify:
- [ ] Email sent to correct customer address
- [ ] Toast shows recipient email address
- [ ] Console logs show correct email
- [ ] Email received in customer inbox
- [ ] Email subject is correct
- [ ] Email body contains all order details
- [ ] Email formatting is correct (HTML renders properly)
- [ ] Multiple customers receive separate emails
- [ ] Same customer receives multiple emails for multiple orders
- [ ] All status types send appropriate emails
- [ ] Cancellation emails include refund info
- [ ] Pickup completion emails are sent

## Monitoring Email Delivery

### Real-time Monitoring
Watch the browser console when updating order status:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Update order status
4. Look for logs:
   - "Sending order status email to: [email]"
   - "✅ Email sent successfully to: [email]"

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Select "send-order-status-email"
4. View logs for:
   - Function invocations
   - Success/error messages
   - Email addresses used

### Database Audit
Check notifications table for backup records:
```sql
SELECT 
  n.created_at,
  p.email,
  n.title,
  n.message,
  n.type
FROM notifications n
JOIN profiles p ON n.user_id = p.id
WHERE n.type = 'order_update'
ORDER BY n.created_at DESC
LIMIT 10;
```

## Best Practices

### For Testing
1. Use real @srit.ac.in email addresses you can access
2. Test with multiple different email addresses
3. Verify emails in both inbox and spam folder
4. Test all status transitions
5. Check console logs for every test
6. Document any failures with screenshots

### For Production
1. Ensure all users have valid email addresses
2. Monitor Edge Function logs regularly
3. Set up alerts for email failures
4. Keep backup in-app notifications
5. Provide users with email preferences
6. Test email delivery after any changes

## Support

### For Users
If you're not receiving order status emails:
1. Check your spam/junk folder
2. Verify your email address in Profile settings
3. Check in-app notifications as backup
4. Contact canteen staff if issue persists

### For Admins
If emails are not being sent:
1. Check console for error messages
2. Verify Edge Function is deployed
3. Check Supabase dashboard for errors
4. Test with a different order
5. Contact technical support with:
   - Order ID
   - Customer email
   - Console error messages
   - Timestamp of attempt

## Conclusion

The email system sends notifications to the customer's registered email address (from the profiles table) whenever their order status changes. The toast notification confirms which email address received the notification, ensuring transparency and allowing admins to verify correct delivery.
