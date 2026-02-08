# SRIT Canteen Pre-order Web App Requirements Document

## 1. Application Overview

### 1.1 Application Name
SRIT Canteen Pre-order Web App

### 1.2 Application Description
A fully responsive, secure, and scalable web application for SRIT students and staff to pre-order meals from the campus canteen. The app ensures robust user registration with strict email verification, dynamic and session-wise menu & inventory management, scheduled pickups with real-time slot availability management, simulated payments with one-time tokenized order confirmation, real-time multi-channel notifications, and comprehensive admin controls.

## 2. User Features

### 2.1 Registration & Access
- Restrict registration to emails ending with @srit.ac.in, validating both prefix and domain strictly against official SRIT email patterns
- Cross-check emails against an official whitelist database; reject unlisted emails
- Send unique activation links via email; accounts stay inactive until verified
- Prevent login for unverified/invalid accounts with clear error messages
- Implement CAPTCHA and rate limiting on registration and login endpoints to prevent abuse
- Provide guest access with limited functionality; guests may optionally save details for future use
- Interface supports multiple languages and conforms to WCAG accessibility standards (keyboard navigation, screen reader support, color contrast)
- Inline form validation with detailed feedback for smooth UX

### 2.2 Menu Browsing & Customization
- Display categorized menu with images, detailed descriptions, prices, and session-wise availability (breakfast, lunch, dinner, etc.)
- Display day-wise menu showing items available for each day of the week
- Show popularity indicators for each menu item (e.g., Most Popular, Trending, Top Seller badges or visual indicators)
- Display popularity metrics such as number of orders or popularity ranking to help users make informed choices
- Support day-wise menu customization and integration with third-party suppliers or menu sources
- Allow item customization including quantity, add-ons, and special instructions with real-time price calculation
- Users can save favorite orders and set recurring meal plans
- Implement lazy loading and image optimization for performance

### 2.3 Pickup Scheduling
- Orders allowed only for current date and predefined time slots
- Each pickup time slot has a maximum number of available slots (e.g., 10 orders per slot)
- When a user selects a specific pickup time slot and successfully places an order, reduce the available slot count of that selected time slot by 1
- Ensure the available slots never go below 0
- If the available slots for a time slot become 0, mark that slot as Fully Booked and prevent further orders for that slot
- The slot count must update in real time so that other users see the reduced availability immediately
- Support waiting lists/queues when slots are fully booked
- Notify users proactively about slot availability or changes

### 2.4 Payment
- Simulate multiple payment methods: card, wallet, cash-on-pickup
- Cash on Pickup payment option is allowed only for snack items
- Cash-on-pickup orders are restricted to a maximum of 2 snack items per order to avoid unnecessary bulk orders and food wastage
- Any order exceeding 2 snack items must be paid using online payment methods only
- Generate a unique, one-time valid token upon payment success for order verification at pickup
- Support partial payments and deposits simulation
- Show detailed order summary before final confirmation

### 2.5 Order Confirmation & Notifications
- Display order confirmation with details and QR code or unique order number
- Simulate multi-channel notifications (email, SMS, in-app push) for order status updates: Pending → Preparing → Ready to Pick Up
- Send email notification to the user whenever the order status is updated
- Allow order modification within allowed timeframe based on order status
- Collect post-order ratings and feedback

### 2.6 Order Receipt Display
- Display order receipt with professional layout design
- Show order status in BIG CAPITAL LETTERS across the background as a watermark effect
- Use light gray color with low opacity for the watermark text
- Apply modern typography for a neat corporate appearance
- Ensure the watermark does not interfere with the readability of order details

### 2.7 Order Pickup & Post-order Actions
- Verify orders quickly at pickup via one-time-use QR code/token
- Provide easy access to order history and reorder functionality
- Offer ongoing promotions and loyalty rewards
- Display sustainability information such as food waste reduction and donation impact
- Enable donation of prepared but canceled meals safely to campus staff or charities

## 3. Admin Features

### 3.1 Secure Login & Roles
- Implement role-based access control for managers, kitchen staff, and cashiers
- Optional multi-factor authentication for enhanced security
- Maintain audit logs of all admin actions

### 3.2 Dashboard & Analytics
- Real-time overview of orders, payments, inventory statuses
- Generate sales and operational reports (daily, weekly, monthly)
- Analyze peak hours, popular items, cancellation trends
- Track and display item popularity metrics based on order frequency and sales data
- Use historical data for predictive demand forecasting
- Display sustainability metrics including food waste and donations

### 3.3 Menu & Inventory Management
- Add, edit, or remove menu items with images, pricing, and session-wise scheduling
- Enable day-wise menu updates and third-party integration for dynamic content
- Configure and manage popularity indicators for menu items based on sales data
- Mark items as snack items to enable cash-on-pickup payment option
- Real-time inventory tracking with barcode scanning integration
- Low-stock and expiry alerts
- Ability to switch off order-taking according to cafeteria timings

### 3.4 Pickup Slot Management
- Configure maximum slot capacity for each pickup time slot
- Monitor real-time slot availability and booking status
- View and manage fully booked slots
- Manually adjust slot capacity when needed
- Track slot utilization patterns and optimize capacity allocation

### 3.5 Order Monitoring & Management
- Filter and view orders by status, user, pickup time, and urgency
- Update order statuses through the preparation lifecycle: Pending → Preparing → Ready to Pick Up
- Automatically trigger email notifications to users when order status is updated
- Handle cancellations initiated by admin with automatic refund processing based on order status:
  - Full refund if order status is Pending
  - 50% refund if order status is Preparing
  - No refund if order status is Ready to Pick Up
- When orders are cancelled by admin, automatically restore slot availability by incrementing the slot count by 1
- Enforce cancellation policies with penalties and partial refunds

### 3.6 Payment Tracking & Refunds
- Monitor all payment transactions securely
- Manage disputes and automate refund workflows
- Generate audit-ready payment reports

### 3.7 User Support & Communication
- Access user profiles, order histories, and feedback
- Respond promptly to complaints or flagged issues
- Send manual or automated notifications for updates, promotions, or alerts

### 3.8 Data & Audit
- Schedule regular backups and data exports
- Maintain secure logs of admin activities
- Ensure compliance with data privacy and security standards

## 4. Additional Technical & UX Enhancements
- Apply CAPTCHA and rate limiting on all critical endpoints for enhanced security
- Encrypt sensitive data at rest and in transit
- Optimize performance using caching strategies for menus, images, and notifications
- Implement PWA features for offline access and push notifications
- Extend language options based on campus demographics
- Provide predictive meal recommendations based on user order history
- Track sustainability metrics such as food waste and encourage eco-friendly packaging
- Design for accessibility beyond WCAG minimums; include testing with screen readers, keyboard-only navigation, and color contrast tools

## 5. Key Specific Functionalities
- Cafeteria owner/admin can edit menus session-wise and day-wise, including third-party menu integration
- Order taking can be switched on/off automatically or manually according to cafeteria timings
- A unique online token is generated upon payment success, valid for only one-time display/use at pickup
- Orders can be placed only for the current date and available time slots
- Each pickup time slot has a configurable maximum capacity; when a slot reaches 0 available slots, it is marked as Fully Booked
- Slot availability updates in real time across all users; when an order is placed, the slot count decreases by 1
- Users do not have the option to cancel orders; only admin can cancel orders through the admin panel
- When admin cancels an order, the slot count increases by 1 (not exceeding maximum capacity)
- Admin cancellation policies:
  - If the order status is Pending, refund 100% of the payment to the user
  - If the order status is Preparing, refund only 50% of the payment, while the remaining amount is retained to cover preparation cost and food wastage
  - If the order status is Ready to Pick Up, no refund will be provided
- Email notifications are automatically sent to users whenever their order status is updated by admin or system
- Users can view day-wise menu showing items available for each day
- Menu items display popularity indicators to show which items are most frequently ordered or trending
- Cash on Pickup payment option is allowed only for snack items
- Cash-on-pickup orders are restricted to a maximum of 2 snack items per order to avoid unnecessary bulk orders and food wastage; orders exceeding this limit must be paid using online payment methods only
- Order receipt displays order status as a watermark in BIG CAPITAL LETTERS with light gray color, low opacity, and modern typography for a professional corporate appearance