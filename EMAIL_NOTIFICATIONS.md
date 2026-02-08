# Email Notification System

## Overview
The SRIT Canteen Pre-order system automatically sends email notifications to customers whenever their order status changes. This keeps customers informed about their order progress from confirmation to completion.

## When Emails Are Sent

### Automatic Email Triggers
Emails are automatically sent when order status changes to:

1. **Confirmed** - Order has been confirmed by canteen staff
2. **Preparing** - Kitchen has started preparing the order
3. **Ready** - Order is ready for pickup at the counter
4. **Completed** - Order has been picked up successfully
5. **Cancelled** - Order has been cancelled (by customer or staff)

### Email Sending Points

#### From Admin Panel
- **Order Management Page**: When admin changes order status using the dropdown
- **Order Pickup Page**: When staff marks order as "Picked Up"

#### From Customer Actions
- **Order Cancellation**: When customer cancels their order from Order History or Order Confirmation page

## Email Content

### Email Structure
Each status update email includes:

**Header:**
- SRIT Canteen branding
- "Order Status Update" title

**Status Badge:**
- Prominent display of new order status
- Color-coded for easy recognition

**Status Message:**
- Clear explanation of what the status means
- Action required (if any)

**Order Details:**
- Order ID (first 8 characters)
- Pickup date and time
- Complete list of items with quantities and prices
- Special instructions (if any)
- Total amount

**Special Alerts:**
- For "Ready" status: Prominent reminder to collect order
- For "Cancelled" status: Refund information

### Status-Specific Messages

#### Confirmed
```
Subject: Order Confirmed - SRIT Canteen
Message: Your order has been confirmed and will be prepared soon.
```

#### Preparing
```
Subject: Order Being Prepared - SRIT Canteen
Message: Your order is now being prepared by our kitchen staff.
```

#### Ready
```
Subject: Order Ready for Pickup - SRIT Canteen
Message: Your order is ready for pickup! Please come to the canteen counter.
Special Alert: ⏰ Please collect your order at the canteen counter
```

#### Completed
```
Subject: Order Completed - SRIT Canteen
Message: Your order has been completed. Thank you for your order!
```

#### Cancelled
```
Subject: Order Cancelled - SRIT Canteen
Message: Your order has been cancelled. If you have any questions, please contact us.
Note: Includes refund amount and percentage
```

## Technical Implementation

### Edge Function
- **Function Name**: `send-order-status-email`
- **Location**: `supabase/functions/send-order-status-email/index.ts`
- **Method**: POST
- **Authentication**: Service role key

### Request Format
```typescript
{
  orderId: string,      // UUID of the order
  userId: string,       // UUID of the user
  newStatus: string,    // New order status
  oldStatus: string     // Previous order status
}
```

### Response Format
```typescript
{
  success: boolean,
  message?: string,
  error?: string
}
```

### Database Trigger
A database trigger (`order_status_change_trigger`) automatically creates in-app notifications when order status changes. Email sending is handled by the application layer for better error handling and user feedback.

## Email Template Features

### Responsive Design
- Mobile-friendly layout
- Maximum width: 600px
- Optimized for all email clients

### Styling
- Professional appearance with SRIT Canteen branding
- Color scheme matches application theme
- Clear visual hierarchy
- Easy-to-read typography

### Accessibility
- Semantic HTML structure
- High contrast text
- Clear call-to-action buttons
- Screen reader friendly

## Error Handling

### Email Sending Failures
If email sending fails:
1. Order status is still updated successfully
2. In-app notification is still created
3. Admin sees informative toast: "Status updated successfully - Order status changed, but email notification could not be sent. Customer can still see the update in the app."
4. Error is logged to console for debugging
5. User can still see status update in the app
6. Toast uses default variant (not destructive) to avoid alarm since the core operation succeeded

### Retry Logic
- No automatic retry (to prevent duplicate emails)
- Admin can manually resend by changing status back and forth
- Users always have in-app notifications as backup

## Testing Email Notifications

### Test Scenario 1: Order Confirmation
1. Admin logs into admin panel
2. Goes to Order Management
3. Finds a "pending" order
4. Changes status to "confirmed"
5. Customer receives "Order Confirmed" email

### Test Scenario 2: Order Preparation
1. Admin changes order status to "preparing"
2. Customer receives "Order Being Prepared" email

### Test Scenario 3: Order Ready
1. Admin changes order status to "ready"
2. Customer receives "Order Ready for Pickup" email with prominent alert

### Test Scenario 4: Order Pickup
1. Staff goes to Order Pickup page
2. Scans customer's QR code
3. Clicks "Mark as Picked Up"
4. Customer receives "Order Completed" email

### Test Scenario 5: Order Cancellation
1. Customer goes to Order History
2. Clicks "Cancel Order" on an eligible order
3. Confirms cancellation
4. Customer receives "Order Cancelled" email with refund details

## Email Delivery

### Supabase Email Service
- Uses Supabase Auth Admin API for email sending
- Reliable delivery through Supabase infrastructure
- No additional email service configuration required

### Email Address
- Sent to the email address in the user's profile
- Must be a valid @srit.ac.in email address
- Verified during registration

### Delivery Time
- Emails are sent immediately after status change
- Typical delivery time: 1-5 seconds
- May take longer during high traffic periods

## Monitoring and Logs

### Success Logging
- Successful email sends are logged to console
- Toast notification confirms email sent to admin

### Error Logging
- Email errors are logged to console with full error details
- Admin sees error toast if email fails
- Order status update still succeeds

### Debugging
To debug email issues:
1. Check browser console for error messages
2. Verify user email address in profiles table
3. Check Supabase Edge Function logs
4. Verify Edge Function is deployed correctly

## Best Practices

### For Admins
1. **Update Status Promptly**: Change order status as soon as work begins
2. **Check Email Confirmation**: Look for success toast after status change
3. **Monitor Errors**: Report any email sending errors to technical team
4. **Don't Spam**: Avoid changing status back and forth unnecessarily

### For Developers
1. **Test Thoroughly**: Test all status transitions before deployment
2. **Handle Errors Gracefully**: Never let email errors block order updates
3. **Log Everything**: Comprehensive logging for debugging
4. **Monitor Performance**: Watch for slow email sending times

## Troubleshooting

### Problem: Emails Not Being Received

**Possible Causes:**
1. Invalid email address in profile
2. Email in spam folder
3. Edge Function not deployed
4. Supabase email service issue

**Solutions:**
1. Verify email address in profiles table
2. Ask user to check spam/junk folder
3. Redeploy Edge Function: `supabase functions deploy send-order-status-email`
4. Check Supabase dashboard for service status

### Problem: Email Sending Slow

**Possible Causes:**
1. Network latency
2. Supabase service load
3. Large order with many items

**Solutions:**
1. Check internet connection
2. Wait a few seconds and check again
3. Email will arrive eventually (async process)

### Problem: Wrong Email Content

**Possible Causes:**
1. Outdated Edge Function code
2. Incorrect order data in database

**Solutions:**
1. Redeploy Edge Function with latest code
2. Verify order data in database
3. Check Edge Function logs for errors

## Security Considerations

### Email Privacy
- Only order owner receives email
- Email address not exposed to other users
- Secure transmission via Supabase

### Authentication
- Edge Function uses service role key
- Only authenticated admins can trigger emails
- User ID validation before sending

### Data Protection
- No sensitive payment information in emails
- Order details only visible to order owner
- Complies with data privacy regulations

## Future Enhancements

### Planned Features
1. **Email Templates**: Customizable email templates for different occasions
2. **Email Preferences**: Allow users to opt-in/opt-out of certain notifications
3. **SMS Notifications**: Add SMS support for critical updates
4. **Email Scheduling**: Schedule reminder emails for pickup time
5. **Rich Formatting**: Add images of ordered items in email
6. **Delivery Reports**: Track email open rates and delivery status

### Configuration Options
1. **Custom Branding**: Customize email colors and logo
2. **Language Support**: Multi-language email templates
3. **Timezone Handling**: Display times in user's timezone
4. **Email Frequency**: Limit email frequency to prevent spam

## Support

### For Users
If you're not receiving emails:
1. Check your spam/junk folder
2. Verify your email address in profile settings
3. Check in-app notifications as backup
4. Contact canteen staff for assistance

### For Admins
If emails are not sending:
1. Check console for error messages
2. Verify Edge Function is deployed
3. Test with a different order
4. Contact technical support

### For Developers
For technical issues:
1. Check Edge Function logs in Supabase dashboard
2. Verify environment variables are set correctly
3. Test Edge Function directly using Supabase CLI
4. Review error logs in browser console

## Conclusion

The email notification system ensures customers stay informed about their order status at every step. With automatic emails for all status changes, customers can track their orders without constantly checking the app, improving overall user experience and satisfaction.
