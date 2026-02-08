# Task: Day-wise Menu and Popular Items

## Requirements
1. Users should see day-wise menu (which items are available on which days)
2. Users should see which items are popular (most sold)

## Plan
- [x] Database Layer
  - [x] Create view/function to calculate item popularity
  - [x] Add query to get items by day of week
  - [x] Add popularity ranking logic
- [x] Backend API
  - [x] Add getPopularItems() function
  - [x] Update getMenuItems() to support day filtering
  - [x] Add getItemsByDay() function
  - [x] Add getMenuItemPopularity() function
- [x] Frontend - Menu Page
  - [x] Add day-of-week filter/selector
  - [x] Show available days on each menu item
  - [x] Add "Popular" badge to popular items
  - [x] Add "Popular Items" section
  - [x] Show order count or popularity indicator
- [x] UI/UX Enhancements
  - [x] Day selector tabs
  - [x] Popular items section with special styling
  - [x] Visual indicators for popularity
  - [x] Available days display on each item
  - [x] Responsive design

## Completed Features

### Database
- Created `menu_item_popularity` view that calculates:
  - Total orders per item
  - Order count (number of unique orders)
  - Popularity ranking
- Created `get_popular_items(limit)` function
- Created `get_items_by_day(day_name)` function
- Added GIN index on `available_days` for better performance

### Backend API
- Added `getPopularItems(limit)` - fetches top N popular items
- Added `getItemsByDay(dayName)` - fetches items available on specific day
- Added `getMenuItemPopularity()` - fetches all items with popularity data
- Added `PopularMenuItem` TypeScript type

### Frontend
- Added day-of-week tabs filter (Monday-Sunday + All Days)
- Added "Popular Items" section at top of menu
- Shows popularity rank (#1, #2, etc.)
- Shows total orders count
- Shows available days on each menu item
- Popular badge on items in main menu grid
- Responsive design for all screen sizes

## Notes
- menu_items table already has available_days column
- Popularity calculated from order_items table
- Only non-cancelled orders count toward popularity
- View automatically updates as new orders are placed
- All days filter shows items available any day
