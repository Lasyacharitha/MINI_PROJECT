# Order Pickup System - Staff Guide

## Overview
The Order Pickup system allows canteen staff to verify and complete customer orders using QR codes or payment tokens. This ensures secure order fulfillment and prevents fraud.

## Accessing the System

### For Admin/Staff:
1. Log in to the admin panel
2. Click **"Order Pickup"** in the sidebar (QR code icon)
3. You'll see the Order Pickup interface

## How to Process an Order

### Step 1: Get Customer Token
When a customer arrives to pick up their order, ask them to:
- Show their Order Confirmation page
- Display the QR code on their phone

### Step 2: Scan or Enter Token
You have two options:

**Option A: Scan QR Code** (Recommended)
- Use a QR code scanner to scan the customer's QR code
- The token will automatically populate in the search field
- Press Enter or click "Search"

**Option B: Manual Entry**
- Ask the customer for their payment token (displayed below the QR code)
- Example token: `ML9GGD2P-WIKY1EZPNCS`
- Type or paste the token into the search field
- Click "Search" button

### Step 3: Verify Order Details
Once the order is found, you'll see:

**Customer Information:**
- Customer email
- Pickup time

**Order Items:**
- Item names with quantities
- Individual prices
- Any customizations or special requests
- Total amount

**Order Status:**
- Current status (pending, confirmed, preparing, ready)
- Payment method
- Order date

### Step 4: Prepare the Order
1. Check all items in the order
2. Verify quantities match
3. Check for any special instructions
4. Prepare items for handover

### Step 5: Complete the Order
1. Hand over the order to the customer
2. Click **"Mark as Picked Up"** button
3. Order status will change to "Completed"
4. Customer receives a notification
5. QR code becomes invalid (one-time use only)

## Order Status Meanings

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| **Pending** | Order placed, awaiting confirmation | Confirm and start preparation |
| **Confirmed** | Order confirmed, not yet started | Begin preparing items |
| **Preparing** | Kitchen is preparing the order | Continue preparation |
| **Ready** | Order is ready for pickup | Wait for customer, then hand over |
| **Completed** | Order has been picked up | No action needed |
| **Cancelled** | Order was cancelled by customer | No action needed |

## Special Cases

### Already Picked Up Orders
- If you scan a QR code that's already been used:
- System shows: "This order has already been picked up"
- Order details are displayed but cannot be completed again
- **Action**: Politely inform customer the order was already collected

### Cancelled Orders
- If customer tries to pick up a cancelled order:
- System shows: "This order has been cancelled"
- **Action**: Explain the order was cancelled and check refund status

### Order Not Found
- If token doesn't match any order:
- System shows: "Order not found. Please check the token and try again"
- **Possible reasons**:
  - Token entered incorrectly
  - Customer showing wrong QR code
  - Order from different location
- **Action**: Ask customer to double-check their order confirmation

### Special Instructions
- Always check the "Special Instructions" section
- Common requests:
  - "Extra spicy"
  - "No onions"
  - "Pack separately"
  - "Extra sauce"
- Ensure all special requests are fulfilled

## Security Features

### One-Time Use QR Codes
- Each QR code can only be used once
- After marking as "Picked Up", the same QR code cannot be used again
- This prevents:
  - Duplicate pickups
  - Fraud attempts
  - Sharing QR codes

### Token Validation
- Tokens are unique and randomly generated
- Cannot be guessed or forged
- Linked directly to specific orders

## Troubleshooting

### Problem: Scanner not working
**Solution:**
- Use manual token entry instead
- Ask customer to read out the token
- Type it carefully (case-sensitive)

### Problem: Customer doesn't have phone
**Solution:**
- Ask for their email address
- Search for order in Order Management page
- Verify identity before handing over

### Problem: Wrong items in order
**Solution:**
- Do NOT mark as completed
- Contact kitchen staff or manager
- Correct the order first
- Then complete the pickup

### Problem: Customer late for pickup
**Solution:**
- Check order status
- If still valid, proceed normally
- If too late, check with manager about policy

## Best Practices

### Speed and Efficiency
1. Keep the Order Pickup page open during busy hours
2. Have QR scanner ready
3. Prepare orders in advance when possible
4. Mark as completed immediately after handover

### Customer Service
1. Greet customers warmly
2. Verify order details with customer
3. Ask if they need anything else
4. Thank them for their order

### Accuracy
1. Always double-check item quantities
2. Read special instructions carefully
3. Verify customer identity if suspicious
4. Don't rush during busy periods

### Communication
1. If order isn't ready, give estimated wait time
2. Apologize for any delays
3. Offer to notify customer when ready
4. Keep customers informed

## Quick Reference

### Keyboard Shortcuts
- **Enter**: Search for order after typing token
- **Tab**: Navigate between fields
- **Esc**: Clear search (if implemented)

### Common Tokens Format
- Format: `XXXXXXXX-XXXXXXXXXXXX`
- Example: `ML9GGD2P-WIKY1EZPNCS`
- Always uppercase
- Contains letters and numbers
- Has one hyphen in the middle

## Staff Training Checklist

Before allowing staff to use the system, ensure they can:
- [ ] Log in to admin panel
- [ ] Navigate to Order Pickup page
- [ ] Scan QR codes correctly
- [ ] Enter tokens manually
- [ ] Read and understand order details
- [ ] Identify special instructions
- [ ] Mark orders as completed
- [ ] Handle "already picked up" situations
- [ ] Handle "order not found" situations
- [ ] Provide good customer service

## Support

### For Technical Issues:
- Contact system administrator
- Check internet connection
- Try refreshing the page
- Clear browser cache if needed

### For Order Issues:
- Contact kitchen manager
- Check Order Management page
- Verify with customer directly
- Document any problems

## Important Reminders

⚠️ **Security**
- Never share admin login credentials
- Always verify customer identity if suspicious
- Report any fraud attempts immediately

⚠️ **Accuracy**
- Double-check every order before handing over
- Read special instructions carefully
- Verify quantities match

⚠️ **Customer Service**
- Be polite and professional
- Handle complaints calmly
- Escalate issues when needed

⚠️ **System Usage**
- Mark orders as completed immediately
- Don't leave orders in "ready" status
- Keep the system updated in real-time
