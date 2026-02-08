# Day-wise Menu and Popular Items Feature

## Overview
Enhanced the menu browsing experience by adding day-wise filtering and popular items indicators, allowing users to see which items are available on specific days and which items are most ordered by other users.

## Features Implemented

### 1. Popular Items Section
- **Dedicated Section**: Displays top 6 most popular items at the top of the menu page
- **Popularity Ranking**: Shows rank (#1, #2, #3, etc.) based on total orders
- **Order Count**: Displays how many times each item has been ordered
- **Visual Indicators**: Special badge with trending icon for popular items
- **Special Styling**: Border highlighting to make popular items stand out

### 2. Day-wise Menu Filtering
- **Day Selector Tabs**: Easy-to-use tabs for each day of the week
- **All Days Option**: View all items regardless of availability
- **Available Days Display**: Each menu item shows which days it's available
- **Smart Filtering**: Automatically filters menu based on selected day

### 3. Enhanced Menu Item Cards
- **Popular Badge**: Items in top rankings show "Popular" badge
- **Available Days**: Shows abbreviated days (Mon, Tue, Wed, etc.)
- **Order Statistics**: Popular items show total order count
- **Category Badge**: Maintains existing category display
- **Session Badge**: Shows meal session (Breakfast, Lunch, Dinner)

## Technical Implementation

### Database Layer

#### menu_item_popularity View
```sql
CREATE VIEW menu_item_popularity AS
SELECT 
  mi.id,
  mi.name,
  mi.category,
  mi.price,
  mi.image_url,
  mi.description,
  mi.available_days,
  mi.is_available,
  COALESCE(SUM(oi.quantity), 0) as total_orders,
  COUNT(DISTINCT oi.order_id) as order_count,
  RANK() OVER (ORDER BY COALESCE(SUM(oi.quantity), 0) DESC) as popularity_rank
FROM menu_items mi
LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled' OR o.status IS NULL
GROUP BY mi.id;
```

**Features**:
- Calculates total orders (sum of quantities)
- Counts unique orders
- Ranks items by popularity
- Excludes cancelled orders
- Automatically updates as new orders are placed

#### get_popular_items Function
```sql
CREATE FUNCTION get_popular_items(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(...) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM menu_item_popularity
  WHERE is_available = true
  ORDER BY total_orders DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

**Features**:
- Configurable limit (default 10)
- Only returns available items
- Sorted by total orders

#### get_items_by_day Function
```sql
CREATE FUNCTION get_items_by_day(day_name TEXT)
RETURNS TABLE(...) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM menu_items
  WHERE is_available = true
  AND (
    available_days IS NULL 
    OR array_length(available_days, 1) IS NULL
    OR day_name = ANY(available_days)
  )
  ORDER BY category, name;
END;
$$ LANGUAGE plpgsql;
```

**Features**:
- Filters by specific day
- Handles NULL available_days (available all days)
- Returns only available items
- Sorted by category and name

#### Performance Optimization
```sql
CREATE INDEX idx_menu_items_available_days 
ON menu_items USING GIN (available_days);
```

### Backend API (src/db/api.ts)

#### New Functions
```typescript
export const getPopularItems = async (limit: number = 10)
export const getItemsByDay = async (dayName: string)
export const getMenuItemPopularity = async ()
```

#### New Type (src/types/types.ts)
```typescript
export interface PopularMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  description: string | null;
  available_days: DayOfWeek[];
  is_available: boolean;
  total_orders: number;
  order_count: number;
  popularity_rank: number;
}
```

### Frontend (src/pages/Menu.tsx)

#### New State Variables
```typescript
const [popularItems, setPopularItems] = useState<PopularMenuItem[]>([]);
const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>('all');
```

#### Day Selector
```typescript
const DAYS_OF_WEEK = [
  { value: 'all', label: 'All Days' },
  { value: 'monday', label: 'Monday' },
  // ... other days
];
```

#### Helper Functions
```typescript
const isItemPopular = (itemId: string) => {
  return popularItems.some(pi => pi.id === itemId);
};

const formatAvailableDays = (days: DayOfWeek[] | null) => {
  if (!days || days.length === 0) return 'All days';
  if (days.length === 7) return 'All days';
  return days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
};
```

## User Experience

### Popular Items Section
1. **Prominent Display**: Shows at top of page with trending icon
2. **Quick Add**: Users can add popular items directly to cart
3. **Social Proof**: Order count shows how many others ordered
4. **Availability Info**: Shows which days item is available

### Day Filtering
1. **Easy Navigation**: Click any day tab to filter
2. **Visual Feedback**: Selected day is highlighted
3. **Instant Results**: Menu updates immediately
4. **Clear Information**: Each item shows its available days

### Menu Items
1. **Popular Badge**: Trending icon + "Popular" badge on popular items
2. **Available Days**: Calendar icon + abbreviated days
3. **Order Count**: Shows on popular items in dedicated section
4. **Consistent Layout**: All information organized clearly

## Benefits

### For Users
- **Discover Popular Items**: See what others are ordering
- **Plan Ahead**: Check menu availability for specific days
- **Make Informed Choices**: Order count provides social proof
- **Better Experience**: Easy filtering and clear information

### For Canteen
- **Promote Popular Items**: Highlight best-sellers
- **Manage Expectations**: Clear day-wise availability
- **Reduce Confusion**: Users know what's available when
- **Data-Driven**: Popularity based on actual orders

## Example Data

Current popular items (from database):
1. **Idli Sambar** - 7 orders (Rank #1)
2. **Veg Thali** - 2 orders (Rank #2)
3. **Masala Dosa** - 2 orders (Rank #2)
4. **Samosa** - 1 order (Rank #4)
5. **Paneer Butter Masala** - 0 orders (Rank #5)

## Files Modified

### Database
- **Migration**: `add_popular_items_functionality.sql`
  - Created `menu_item_popularity` view
  - Created `get_popular_items()` function
  - Created `get_items_by_day()` function
  - Added GIN index on `available_days`
  - Granted permissions to anon and authenticated users

### Backend
- **src/db/api.ts**
  - Added `getPopularItems()`
  - Added `getItemsByDay()`
  - Added `getMenuItemPopularity()`

- **src/types/types.ts**
  - Added `PopularMenuItem` interface

### Frontend
- **src/pages/Menu.tsx**
  - Added popular items section
  - Added day selector tabs
  - Added popular badges to menu items
  - Added available days display
  - Enhanced filtering logic
  - Improved UI/UX

## Testing

### Database Functions
```sql
-- Test popular items
SELECT * FROM get_popular_items(5);

-- Test items by day
SELECT * FROM get_items_by_day('monday');

-- Test popularity view
SELECT * FROM menu_item_popularity ORDER BY total_orders DESC;
```

### Frontend Testing
1. Navigate to /menu
2. Verify popular items section appears at top
3. Click different day tabs and verify filtering
4. Check that popular badges appear on items
5. Verify available days display correctly
6. Test add to cart functionality

## Future Enhancements

### Potential Improvements
1. **Trending Indicator**: Show items gaining popularity
2. **Time-based Popularity**: Popular this week/month
3. **Personalized Recommendations**: Based on user's order history
4. **Ratings Integration**: Combine popularity with ratings
5. **Seasonal Items**: Highlight items available only certain days
6. **Pre-order for Future Days**: Allow ordering for specific days

### Performance Optimizations
1. **Materialized View**: For large datasets, use materialized view
2. **Caching**: Cache popular items for better performance
3. **Pagination**: For large menu catalogs
4. **Lazy Loading**: Load images as user scrolls

## Status
✅ **COMPLETED** - All features implemented and tested

## Date
2026-02-05
