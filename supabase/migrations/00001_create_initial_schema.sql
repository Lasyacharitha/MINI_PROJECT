-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('student', 'staff', 'admin', 'kitchen_staff', 'cashier');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');

-- Create payment method enum
CREATE TYPE public.payment_method AS ENUM ('card', 'wallet', 'cash_on_pickup');

-- Create session type enum
CREATE TYPE public.session_type AS ENUM ('breakfast', 'lunch', 'snacks', 'dinner');

-- Create day of week enum
CREATE TYPE public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role public.user_role NOT NULL DEFAULT 'student',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email whitelist table
CREATE TABLE public.email_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  added_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu sessions table
CREATE TABLE public.menu_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  session_type public.session_type NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  order_cutoff_minutes INTEGER DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  session_id UUID REFERENCES public.menu_sessions(id),
  available_days public.day_of_week[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']::public.day_of_week[],
  is_available BOOLEAN DEFAULT TRUE,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status public.order_status DEFAULT 'pending',
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  pickup_slot TEXT NOT NULL,
  payment_method public.payment_method NOT NULL,
  payment_token TEXT UNIQUE,
  payment_completed BOOLEAN DEFAULT FALSE,
  qr_code TEXT,
  token_used BOOLEAN DEFAULT FALSE,
  special_instructions TEXT,
  cancellation_reason TEXT,
  refund_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  customizations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  low_stock_threshold DECIMAL(10, 2) DEFAULT 10,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin logs table
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id)
);

-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-9f96oosv4npd_menu_images', 'app-9f96oosv4npd_menu_images', true);

-- Storage policies for menu images
CREATE POLICY "Public can view menu images" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-9f96oosv4npd_menu_images');

CREATE POLICY "Authenticated users can upload menu images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'app-9f96oosv4npd_menu_images');

CREATE POLICY "Authenticated users can update menu images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'app-9f96oosv4npd_menu_images');

CREATE POLICY "Authenticated users can delete menu images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'app-9f96oosv4npd_menu_images');

-- Create helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role IN ('admin')
  );
$$;

-- Create helper function to check staff role
CREATE OR REPLACE FUNCTION is_staff(uid UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role IN ('admin', 'kitchen_staff', 'cashier')
  );
$$;

-- Trigger function to sync auth.users to profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INT;
  is_whitelisted BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Check if email is in whitelist (only for non-first users)
  IF user_count > 0 THEN
    SELECT EXISTS(SELECT 1 FROM email_whitelist WHERE email = NEW.email) INTO is_whitelisted;
    
    -- If not whitelisted and not @srit.ac.in, reject
    IF NOT is_whitelisted AND NEW.email NOT LIKE '%@srit.ac.in' THEN
      RAISE EXCEPTION 'Email not authorized. Only @srit.ac.in emails are allowed.';
    END IF;
  END IF;
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'student'::public.user_role END,
    TRUE
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for user confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for email_whitelist
ALTER TABLE public.email_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whitelist" ON public.email_whitelist
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can check whitelist" ON public.email_whitelist
  FOR SELECT TO anon, authenticated USING (true);

-- RLS Policies for menu_sessions
ALTER TABLE public.menu_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active sessions" ON public.menu_sessions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage sessions" ON public.menu_sessions
  FOR ALL TO authenticated USING (is_staff(auth.uid()));

-- RLS Policies for menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view available menu items" ON public.menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Staff can manage menu items" ON public.menu_items
  FOR ALL TO authenticated USING (is_staff(auth.uid()));

-- RLS Policies for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders" ON public.orders
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Staff can view all orders" ON public.orders
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));

CREATE POLICY "Staff can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (is_staff(auth.uid()));

-- RLS Policies for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Staff can view all order items" ON public.order_items
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));

-- RLS Policies for inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage inventory" ON public.inventory
  FOR ALL TO authenticated USING (is_staff(auth.uid()));

-- RLS Policies for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback" ON public.feedback
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback" ON public.feedback
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all feedback" ON public.feedback
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));

-- RLS Policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Staff can create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));

-- RLS Policies for admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view logs" ON public.admin_logs
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create logs" ON public.admin_logs
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their favorites" ON public.favorites
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Insert default menu sessions
INSERT INTO public.menu_sessions (name, session_type, start_time, end_time, order_cutoff_minutes) VALUES
  ('Breakfast', 'breakfast', '07:00', '10:00', 60),
  ('Lunch', 'lunch', '12:00', '15:00', 120),
  ('Snacks', 'snacks', '16:00', '18:00', 60),
  ('Dinner', 'dinner', '19:00', '22:00', 120);

-- Insert some sample menu items
INSERT INTO public.menu_items (name, description, price, category, session_id, stock) 
SELECT 
  'Idli Sambar', 
  'Steamed rice cakes served with sambar and chutney', 
  40.00, 
  'South Indian', 
  id, 
  50
FROM public.menu_sessions WHERE session_type = 'breakfast' LIMIT 1;

INSERT INTO public.menu_items (name, description, price, category, session_id, stock) 
SELECT 
  'Masala Dosa', 
  'Crispy dosa filled with spiced potato filling', 
  50.00, 
  'South Indian', 
  id, 
  40
FROM public.menu_sessions WHERE session_type = 'breakfast' LIMIT 1;

INSERT INTO public.menu_items (name, description, price, category, session_id, stock) 
SELECT 
  'Veg Thali', 
  'Complete meal with rice, roti, dal, vegetables, and curd', 
  80.00, 
  'North Indian', 
  id, 
  60
FROM public.menu_sessions WHERE session_type = 'lunch' LIMIT 1;

INSERT INTO public.menu_items (name, description, price, category, session_id, stock) 
SELECT 
  'Chicken Biryani', 
  'Aromatic basmati rice cooked with tender chicken and spices', 
  120.00, 
  'Biryani', 
  id, 
  30
FROM public.menu_sessions WHERE session_type = 'lunch' LIMIT 1;

INSERT INTO public.menu_items (name, description, price, category, session_id, stock) 
SELECT 
  'Samosa', 
  'Crispy fried pastry filled with spiced potatoes', 
  20.00, 
  'Snacks', 
  id, 
  100
FROM public.menu_sessions WHERE session_type = 'snacks' LIMIT 1;

INSERT INTO public.menu_items (name, description, price, category, session_id, stock) 
SELECT 
  'Paneer Butter Masala', 
  'Cottage cheese in rich tomato gravy with rice/roti', 
  100.00, 
  'North Indian', 
  id, 
  40
FROM public.menu_sessions WHERE session_type = 'dinner' LIMIT 1;