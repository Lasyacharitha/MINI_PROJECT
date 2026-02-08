# Email Setup Guide for SRIT Canteen

## Current Status: Email Simulation Mode

The application is currently in **email simulation mode**. This means:
- ✅ Email notifications are triggered correctly
- ✅ Email content is generated properly
- ✅ Recipient addresses are identified correctly
- ❌ Actual emails are NOT sent to inboxes

## Why Emails Aren't Being Sent

Supabase's `auth.admin.sendEmail()` is designed for **authentication emails only** (password resets, email verification), not transactional emails like order status updates.

To send real emails, you need to integrate a third-party email service.

## Setting Up Real Email Delivery

### Option 1: Resend (Recommended - Easiest)

**Why Resend?**
- Simple API
- Generous free tier (3,000 emails/month)
- Great deliverability
- Easy to set up

**Setup Steps:**

1. **Sign up for Resend**
   - Go to https://resend.com
   - Create a free account
   - Verify your domain (or use their test domain)

2. **Get API Key**
   - Go to API Keys section
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Add to Supabase Secrets**
   ```bash
   # In Supabase Dashboard > Project Settings > Edge Functions > Secrets
   RESEND_API_KEY=re_your_api_key_here
   ```

4. **Update Edge Function**
   Replace the email sending code in `supabase/functions/send-order-status-email/index.ts`:

   ```typescript
   // Replace this:
   const { error: emailError } = await supabase.auth.admin.sendEmail({
     email: profile.email,
     subject: `${emailSubject} - SRIT Canteen`,
     html: emailHtml,
   });

   // With this:
   const resendApiKey = Deno.env.get('RESEND_API_KEY');
   
   const emailResponse = await fetch('https://api.resend.com/emails', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${resendApiKey}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       from: 'SRIT Canteen <noreply@yourdomain.com>',
       to: [profile.email],
       subject: `${emailSubject} - SRIT Canteen`,
       html: emailHtml,
     }),
   });

   if (!emailResponse.ok) {
     const error = await emailResponse.text();
     console.error('Resend API error:', error);
     throw new Error(`Failed to send email: ${error}`);
   }

   const emailData = await emailResponse.json();
   console.log('Email sent via Resend:', emailData);
   ```

5. **Redeploy Edge Function**
   ```bash
   supabase functions deploy send-order-status-email
   ```

### Option 2: SendGrid

**Setup Steps:**

1. **Sign up for SendGrid**
   - Go to https://sendgrid.com
   - Create free account (100 emails/day)

2. **Get API Key**
   - Go to Settings > API Keys
   - Create API Key with "Mail Send" permission

3. **Add to Supabase Secrets**
   ```bash
   SENDGRID_API_KEY=SG.your_api_key_here
   ```

4. **Update Edge Function**
   ```typescript
   const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
   
   const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${sendgridApiKey}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       personalizations: [{
         to: [{ email: profile.email }],
         subject: `${emailSubject} - SRIT Canteen`,
       }],
       from: {
         email: 'noreply@yourdomain.com',
         name: 'SRIT Canteen'
       },
       content: [{
         type: 'text/html',
         value: emailHtml
       }]
     }),
   });
   ```

### Option 3: Mailgun

**Setup Steps:**

1. **Sign up for Mailgun**
   - Go to https://mailgun.com
   - Free tier: 5,000 emails/month for 3 months

2. **Get API Key and Domain**
   - Go to Settings > API Keys
   - Note your domain (e.g., sandbox123.mailgun.org)

3. **Add to Supabase Secrets**
   ```bash
   MAILGUN_API_KEY=your_api_key_here
   MAILGUN_DOMAIN=sandbox123.mailgun.org
   ```

4. **Update Edge Function**
   ```typescript
   const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
   const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
   
   const formData = new FormData();
   formData.append('from', 'SRIT Canteen <noreply@' + mailgunDomain + '>');
   formData.append('to', profile.email);
   formData.append('subject', `${emailSubject} - SRIT Canteen`);
   formData.append('html', emailHtml);
   
   const emailResponse = await fetch(
     `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
     {
       method: 'POST',
       headers: {
         'Authorization': 'Basic ' + btoa('api:' + mailgunApiKey),
       },
       body: formData,
     }
   );
   ```

## Testing Email Delivery

### 1. Test with Your Own Email First

Before testing with @srit.ac.in emails:
1. Update a test user's email to your personal email
2. Place a test order
3. Change order status
4. Check your inbox (and spam folder)

### 2. Verify Email Service Dashboard

Check your email service dashboard:
- **Resend**: Dashboard > Emails > Recent sends
- **SendGrid**: Activity > Email Activity
- **Mailgun**: Sending > Logs

### 3. Check Edge Function Logs

In Supabase Dashboard:
1. Go to Edge Functions
2. Select `send-order-status-email`
3. View logs for errors

## Current Simulation Features

While in simulation mode, the system:

1. **Creates Database Records**
   - All email attempts are logged to `notifications` table
   - You can query: `SELECT * FROM notifications WHERE type = 'order_update'`

2. **Shows Toast Notifications**
   - Admins see confirmation when "email" is triggered
   - Displays recipient email address

3. **Console Logging**
   - Detailed logs in browser console
   - Shows email content and recipient

4. **In-App Notifications**
   - Users see notifications in the app
   - Accessible via notification bell icon

## Recommended: Email Logging Table

Create a dedicated email log table for tracking:

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT,
  status TEXT NOT NULL, -- 'sent', 'failed', 'pending'
  error_message TEXT,
  order_id UUID REFERENCES orders(id),
  email_type TEXT NOT NULL, -- 'order_status', 'order_confirmation', etc.
  metadata JSONB
);

-- Index for querying
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_order ON email_logs(order_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
```

Then update the Edge Function to log all attempts:

```typescript
// Log email attempt
await supabase.from('email_logs').insert({
  recipient_email: profile.email,
  subject: `${emailSubject} - SRIT Canteen`,
  body_html: emailHtml,
  status: 'sent', // or 'failed'
  order_id: orderId,
  email_type: 'order_status',
  metadata: { newStatus, oldStatus }
});
```

## Domain Verification (Important!)

For production use with @srit.ac.in emails:

1. **Verify Your Domain**
   - Most email services require domain verification
   - Add DNS records (SPF, DKIM, DMARC)
   - This prevents emails from going to spam

2. **Use Proper From Address**
   - Use a domain you control: `noreply@yourdomain.com`
   - Don't use @srit.ac.in unless you have permission
   - Consider: `canteen@yourdomain.com`

3. **Set Up SPF Record**
   ```
   v=spf1 include:_spf.resend.com ~all
   ```

4. **Set Up DKIM**
   - Follow your email service's instructions
   - Usually involves adding TXT records

## Testing Checklist

Before going live:

- [ ] Email service account created
- [ ] API key added to Supabase secrets
- [ ] Edge Function updated with new code
- [ ] Edge Function redeployed
- [ ] Test email sent to your personal email
- [ ] Email received (check spam folder)
- [ ] Email formatting looks correct
- [ ] Links in email work (if any)
- [ ] Test with @srit.ac.in email
- [ ] Domain verification completed (if required)
- [ ] SPF/DKIM records added
- [ ] Email logs table created
- [ ] Monitoring set up

## Monitoring Email Delivery

### 1. Email Service Dashboard
- Check delivery rates
- Monitor bounce rates
- Watch for spam complaints

### 2. Database Logs
```sql
-- Check recent email attempts
SELECT 
  created_at,
  recipient_email,
  subject,
  status,
  error_message
FROM email_logs
ORDER BY created_at DESC
LIMIT 20;

-- Check failure rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM email_logs
GROUP BY status;
```

### 3. Set Up Alerts
- Alert when email failure rate > 5%
- Alert when specific user reports not receiving emails
- Monitor daily email volume

## Troubleshooting

### Problem: Emails Going to Spam

**Solutions:**
1. Verify domain with SPF/DKIM records
2. Use a professional "from" address
3. Avoid spam trigger words in subject
4. Include unsubscribe link (for marketing emails)
5. Warm up your sending domain gradually

### Problem: Emails Not Sending

**Check:**
1. API key is correct and active
2. Email service account has credits/quota
3. Edge Function logs for errors
4. Recipient email is valid
5. Email service dashboard for blocks

### Problem: High Bounce Rate

**Solutions:**
1. Validate email addresses before sending
2. Remove invalid emails from database
3. Use email verification during registration
4. Check for typos in email addresses

## Cost Estimates

### Free Tiers (Suitable for Testing)
- **Resend**: 3,000 emails/month free
- **SendGrid**: 100 emails/day free (3,000/month)
- **Mailgun**: 5,000 emails/month free (first 3 months)

### Paid Plans (For Production)
- **Resend**: $20/month for 50,000 emails
- **SendGrid**: $19.95/month for 50,000 emails
- **Mailgun**: $35/month for 50,000 emails

### Estimated Usage for SRIT Canteen
Assuming:
- 100 orders/day
- 4 status updates per order (confirmed, preparing, ready, completed)
- 400 emails/day = 12,000 emails/month

**Recommendation**: Start with Resend free tier, upgrade if needed.

## Next Steps

1. **Choose an email service** (Resend recommended)
2. **Sign up and get API key**
3. **Add API key to Supabase secrets**
4. **Update Edge Function code** (see examples above)
5. **Redeploy Edge Function**
6. **Test with your personal email**
7. **Verify emails are received**
8. **Test with @srit.ac.in emails**
9. **Set up domain verification** (if required)
10. **Monitor delivery rates**

## Support

### For Resend
- Docs: https://resend.com/docs
- Support: support@resend.com

### For SendGrid
- Docs: https://docs.sendgrid.com
- Support: https://support.sendgrid.com

### For Mailgun
- Docs: https://documentation.mailgun.com
- Support: https://help.mailgun.com

## Conclusion

The email notification system is fully implemented and ready to send real emails once you integrate an email service. The current simulation mode allows you to test all functionality without sending actual emails. Follow this guide to set up real email delivery in production.
