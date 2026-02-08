export type UserRole = 'student' | 'staff' | 'admin' | 'kitchen_staff' | 'cashier';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type PaymentMethod = 'card' | 'wallet' | 'cash_on_pickup';

export type SessionType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailWhitelist {
  id: string;
  email: string;
  added_by: string | null;
  created_at: string;
}

export interface MenuSession {
  id: string;
  name: string;
  session_type: SessionType;
  start_time: string;
  end_time: string;
  is_active: boolean;
  order_cutoff_minutes: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  session_id: string | null;
  available_days: DayOfWeek[];
  is_available: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  pickup_date: string;
  pickup_time: string;
  pickup_slot: string;
  payment_method: PaymentMethod;
  payment_token: string | null;
  payment_completed: boolean;
  qr_code: string | null;
  token_used: boolean;
  special_instructions: string | null;
  cancellation_reason: string | null;
  refund_amount: number | null;
  refund_status: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  customizations: Record<string, unknown> | null;
  created_at: string;
}

export interface Inventory {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  order_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  menu_item_id: string;
  created_at: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations?: Record<string, unknown>;
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { menu_items: MenuItem })[];
  profiles: Profile;
}

export interface MenuItemWithSession extends MenuItem {
  menu_sessions: MenuSession | null;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockItems: number;
}

export interface PickupSlot {
  id: string;
  date: string;
  time_slot: string;
  max_capacity: number;
  current_bookings: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlotAvailability {
  available_slots: number;
  max_capacity: number;
  is_available: boolean;
}

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
