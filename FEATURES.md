# SRIT Canteen Pre-order Web App - Features

## ✅ Implemented Features

### 1. Day-Wise Menu Management
- **Admin Control**: Admins can set which days each menu item is available (Monday-Sunday)
- **Automatic Filtering**: Menu page automatically shows only items available on the current day
- **Visual Indicators**: Available days displayed as badges in admin panel
- **Flexible Scheduling**: Each item can be available on any combination of days

### 2. Menu Item Images
- **Image Upload**: Admins can upload images for menu items (max 1MB)
- **Real Food Photos**: All sample menu items now have professional food photography
- **Image Preview**: Preview images before uploading
- **Visual Menu**: Menu items display with images on both user and admin pages
- **Fallback Display**: Items without images show a placeholder icon

### 3. Current Menu Items with Images
- **Idli Sambar** (Breakfast) - South Indian rice cakes with lentil curry
- **Masala Dosa** (Breakfast) - Crispy crepe with potato filling
- **Veg Thali** (Lunch) - Complete vegetarian meal
- **Chicken Biryani** (Lunch) - Aromatic rice with chicken
- **Samosa** (Snacks) - Crispy fried snack with potato filling
- **Paneer Butter Masala** (Dinner) - Cottage cheese in tomato gravy

### 4. Image Upload Features
- **File Validation**: Checks file type and size before upload
- **Size Limit**: Maximum 1MB per image
- **Supabase Storage**: Images stored in dedicated bucket
- **Public URLs**: Automatic generation of public image URLs
- **Image Management**: Ability to replace or remove images

### 5. Day-Wise Filtering Logic
- **Automatic Detection**: System detects current day of week
- **Smart Filtering**: Only shows items available on current day
- **Admin Override**: Admins can see all items regardless of day
- **Session Integration**: Works with session-wise menu management

### 6. Order Cancellation System
- **Time-Based Restrictions**: Orders can be cancelled up to 2 hours before pickup
- **Status-Based Refunds**: Full refund (100%) before preparation, partial refund (50%) after
- **Smart Blocking**: Prevents cancellation once order is completed or within 2-hour window
- **User Warnings**: Clear alerts about refund amounts before cancellation
- **Automatic Notifications**: Users receive in-app notifications with refund details
- **Visual Indicators**: Cancel button with status-based warnings and alerts

## How It Works

### For Admins:
1. Go to Admin Panel → Menu Management
2. Click "Add Menu Item" or edit existing item
3. Upload an image (optional but recommended)
4. Select which days the item should be available
5. Set session, price, stock, and other details
6. Save the item

### For Users:
1. Visit the Menu page
2. See only items available today
3. Browse items with images and descriptions
4. Filter by category or session
5. Add items to cart and place order
6. View order confirmation with QR code
7. Cancel order if needed (up to 2 hours before pickup)

### For Cancellation:
1. Go to Order History or Order Confirmation page
2. Click "Cancel Order" button (if eligible)
3. Review refund amount in confirmation dialog
4. Confirm cancellation
5. Receive notification with refund details
6. Order status updated to "Cancelled"

## Technical Implementation

### Database Schema:
- `menu_items.available_days`: Array of day names (monday, tuesday, etc.)
- `menu_items.image_url`: Public URL to uploaded image
- `orders.status`: Tracks order lifecycle (pending, confirmed, preparing, ready, completed, cancelled)
- Storage bucket: `app-9f96oosv4npd_menu_images`

### Frontend Logic:
- Day detection: `new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()`
- Filtering: `items.filter(item => item.available_days.includes(today))`
- Image upload: Supabase Storage API with validation
- Cancellation check: `canCancelOrder(pickupDate, pickupTime, hoursBeforePickup = 2)`

### Cancellation API:
- `cancelOrder(orderId)`: Handles cancellation logic with refund calculation
- Checks order status and time restrictions
- Calculates refund: 100% for pending/confirmed, 50% for preparing/ready
- Updates order status and creates notification
- Returns success status and refund amount

### Admin Features:
- Checkbox selection for each day of week
- Image upload with preview
- Visual display of available days as badges
- Image thumbnail in menu items table

## Benefits

1. **Flexible Menu Planning**: Different menus for different days
2. **Visual Appeal**: Professional food photos attract customers
3. **Easy Management**: Simple interface for admins to manage
4. **Automatic Updates**: Menu automatically updates based on day
5. **Better UX**: Users see only relevant items for today
6. **Customer Flexibility**: Fair cancellation policy with clear refund rules
7. **Reduced Waste**: 2-hour cancellation window allows kitchen to adjust
8. **Transparent Process**: Clear warnings and notifications throughout

## Cancellation Policy Summary

- **Full Refund (100%)**: Cancel before kitchen starts preparation (pending/confirmed status)
- **Partial Refund (50%)**: Cancel after preparation starts (preparing/ready status)
- **No Cancellation**: Within 2 hours of pickup or after completion
- **Automatic Notifications**: Users receive refund details immediately
- **Visual Warnings**: Clear alerts about refund amounts before confirmation
