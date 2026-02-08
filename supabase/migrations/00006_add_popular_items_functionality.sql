-- Create a view to track item popularity based on order count
CREATE OR REPLACE VIEW menu_item_popularity AS
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
GROUP BY mi.id, mi.name, mi.category, mi.price, mi.image_url, mi.description, mi.available_days, mi.is_available;

-- Function to get popular items (top N items)
CREATE OR REPLACE FUNCTION get_popular_items(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  category TEXT,
  price DECIMAL,
  image_url TEXT,
  description TEXT,
  available_days TEXT[],
  is_available BOOLEAN,
  total_orders BIGINT,
  order_count BIGINT,
  popularity_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM menu_item_popularity
  WHERE menu_item_popularity.is_available = true
  ORDER BY total_orders DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get items available on a specific day
CREATE OR REPLACE FUNCTION get_items_by_day(day_name TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  category TEXT,
  price DECIMAL,
  image_url TEXT,
  description TEXT,
  available_days TEXT[],
  is_available BOOLEAN,
  session_id UUID,
  stock INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id,
    mi.name,
    mi.category,
    mi.price,
    mi.image_url,
    mi.description,
    mi.available_days,
    mi.is_available,
    mi.session_id,
    mi.stock,
    mi.created_at,
    mi.updated_at
  FROM menu_items mi
  WHERE mi.is_available = true
  AND (
    mi.available_days IS NULL 
    OR array_length(mi.available_days, 1) IS NULL
    OR day_name = ANY(mi.available_days)
  )
  ORDER BY mi.category, mi.name;
END;
$$ LANGUAGE plpgsql;

-- Add index for better performance on available_days queries
CREATE INDEX IF NOT EXISTS idx_menu_items_available_days ON menu_items USING GIN (available_days);

-- Grant permissions
GRANT SELECT ON menu_item_popularity TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_popular_items TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_items_by_day TO anon, authenticated;