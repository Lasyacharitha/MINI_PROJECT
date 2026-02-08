# Professional Receipt Design - Quick Guide

## What Was Implemented

### ✨ Status Watermark Effect

**Large, rotated status text in the background of order receipts**

```
┌────────────────────────────────────────────┐
│                                            │
│           P E N D I N G                    │  ← HUGE text
│        (rotated -45°, 3% opacity)          │     Light gray
│                                            │     Behind content
│  ╔══════════════════════════════════════╗ │
│  ║ Order Receipt        #49DD3B53       ║ │
│  ║ ──────────────────────────────────── ║ │
│  ║ Order Date: Feb 7, 2026              ║ │
│  ║ Pickup Time: 18:00                   ║ │
│  ║ Status: [Pending]                    ║ │
│  ║ ──────────────────────────────────── ║ │
│  ║ Idli Sambar × 3         ₹120.00      ║ │
│  ║ ──────────────────────────────────── ║ │
│  ║ TOTAL AMOUNT            ₹120.00      ║ │
│  ╚══════════════════════════════════════╝ │
│                                            │
└────────────────────────────────────────────┘
```

---

## Key Features

### 1. Watermark Specifications
- **Text**: Order status in CAPITAL LETTERS
- **Size**: VERY LARGE (8-12rem / 128-192px)
- **Color**: Light gray (muted-foreground)
- **Opacity**: 2-3% (extremely subtle)
- **Rotation**: -45 degrees (diagonal)
- **Font**: Black weight (900)
- **Spacing**: Wide letter tracking

### 2. Professional Receipt Layout
- **Clean sections** with clear borders
- **Uppercase labels** with tracking
- **Bold totals** with primary color
- **Proper hierarchy** with font sizes
- **Corporate styling** throughout

### 3. Enhanced QR Code Card
- **Subtle pattern** background
- **Professional border** (2px)
- **Pill-style token** display
- **Warning icon** for one-time use

---

## Where It's Applied

### ✅ OrderConfirmation Page
- Main receipt card with watermark
- Professional order details layout
- Enhanced QR code presentation

### ✅ OrderHistory Page
- Order list cards with watermark
- Improved typography hierarchy
- Better status badges

---

## Status Examples

### PENDING
```
Light gray "PENDING" rotated diagonally
Opacity: 3%
Behind: Order details with pending badge
```

### PREPARING
```
Light gray "PREPARING" rotated diagonally
Opacity: 3%
Behind: Order details with preparing badge
```

### READY
```
Light gray "READY" rotated diagonally
Opacity: 3%
Behind: Order details with ready badge
```

### COMPLETED
```
Light gray "COMPLETED" rotated diagonally
Opacity: 3%
Behind: Order details with completed badge
```

### CANCELLED
```
Light gray "CANCELLED" rotated diagonally
Opacity: 3%
Behind: Order details with cancelled badge + refund info
```

---

## Design Principles

### ✅ Professional
- Corporate receipt appearance
- Clean, organized layout
- Proper spacing and alignment

### ✅ Modern
- Large typography for watermark
- Wide letter spacing
- Subtle opacity effects

### ✅ Readable
- Low opacity doesn't interfere
- High contrast for content
- Clear visual hierarchy

### ✅ Responsive
- Smaller watermark on mobile (8rem)
- Larger watermark on desktop (12rem)
- Adapts to all screen sizes

---

## Technical Details

### Watermark Implementation
```tsx
{/* Watermark Container */}
<div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
  {/* Watermark Text */}
  <div 
    className="text-[8rem] md:text-[12rem] font-black tracking-wider opacity-[0.03] text-muted-foreground whitespace-nowrap"
    style={{ 
      transform: 'rotate(-45deg)',
      letterSpacing: '0.1em'
    }}
  >
    {getOrderStatusLabel(order.status).toUpperCase()}
  </div>
</div>
```

### Content Layering
```tsx
{/* Card with overflow hidden */}
<Card className="relative overflow-hidden">
  {/* Watermark (z-index: auto, behind) */}
  <div className="absolute ...">...</div>
  
  {/* Content (z-index: 10, front) */}
  <CardHeader className="relative z-10">...</CardHeader>
  <CardContent className="relative z-10">...</CardContent>
</Card>
```

---

## Visual Comparison

### Before ❌
```
┌─────────────────────────────┐
│ Order Details               │
│ ─────────────────────────── │
│ Order Date: Feb 7, 2026     │
│ Pickup Time: 18:00          │
│ Status: Pending             │
│ ─────────────────────────── │
│ Idli Sambar × 3   ₹120.00   │
│ ─────────────────────────── │
│ Total: ₹120.00              │
└─────────────────────────────┘
```
Plain, basic layout

### After ✅
```
┌─────────────────────────────────────┐
│                                     │
│      P E N D I N G                  │  ← Watermark!
│                                     │
│ Order Receipt          #49DD3B53    │
│ ═══════════════════════════════════ │
│ ORDER DATE         PICKUP TIME      │
│ Feb 7, 2026        18:00:00         │
│                                     │
│ PAYMENT METHOD     STATUS           │
│ Card               [Pending]        │
│ ═══════════════════════════════════ │
│ ORDER ITEMS                         │
│ Idli Sambar                         │
│ Qty: 3 × ₹40.00           ₹120.00   │
│ ═══════════════════════════════════ │
│ TOTAL AMOUNT              ₹120.00   │
│ ═══════════════════════════════════ │
└─────────────────────────────────────┘
```
Professional, corporate receipt with watermark

---

## How to View

### Step 1: Place an Order
1. Go to Menu (`/menu`)
2. Add items to cart
3. Go to Checkout
4. Complete order

### Step 2: View Receipt
- Automatically redirected to Order Confirmation
- See professional receipt with status watermark
- Notice the large "PENDING" text in background

### Step 3: View Order History
1. Go to Order History (`/orders`)
2. See all orders with watermarks
3. Click "View Details" to see full receipt

---

## Status Watermark Examples

### Mobile View (8rem)
```
     P E N D I N G
  (Medium-large, rotated)
```

### Desktop View (12rem)
```
        P E N D I N G
   (VERY LARGE, rotated)
```

### Opacity Effect
```
Normal text:  ████████  (100% opacity)
Watermark:    ░░░░░░░░  (3% opacity - barely visible)
```

---

## Summary

✅ **BIG CAPITAL LETTERS** - Status text in huge font size
✅ **Light gray color** - Uses muted-foreground color
✅ **Low opacity** - 2-3% for subtle effect
✅ **Modern typography** - Black weight, wide tracking
✅ **Corporate appearance** - Professional receipt layout
✅ **Rotated watermark** - -45 degree diagonal effect
✅ **Responsive design** - Adapts to all screen sizes

**Result**: Professional, modern order receipts that look like real corporate documents with sophisticated watermark effects.

---

## Files Changed

- `src/pages/OrderConfirmation.tsx` - Added watermark and professional layout
- `src/pages/OrderHistory.tsx` - Added watermark to order cards

**No breaking changes** - All existing functionality preserved
