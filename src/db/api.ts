import { supabase } from './supabase';
import type {
  Profile,
  MenuItem,
  MenuSession,
  Order,
  OrderItem,
  Inventory,
  Feedback,
  Notification,
  EmailWhitelist,
  OrderWithItems,
  MenuItemWithSession,
  AdminLog,
  Favorite,
} from '@/types';

// Profile APIs
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
};

export const getAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

// Email Whitelist APIs
export const checkEmailWhitelist = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('email_whitelist')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Error checking whitelist:', error);
    return false;
  }
  return !!data;
};

export const addEmailToWhitelist = async (email: string, addedBy: string): Promise<EmailWhitelist | null> => {
  const { data, error } = await supabase
    .from('email_whitelist')
    .insert({ email, added_by: addedBy })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding to whitelist:', error);
    return null;
  }
  return data;
};

export const getWhitelist = async (): Promise<EmailWhitelist[]> => {
  const { data, error } = await supabase
    .from('email_whitelist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching whitelist:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const removeEmailFromWhitelist = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('email_whitelist')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing from whitelist:', error);
    return false;
  }
  return true;
};

// Menu Session APIs
export const getActiveSessions = async (): Promise<MenuSession[]> => {
  const { data, error } = await supabase
    .from('menu_sessions')
    .select('*')
    .eq('is_active', true)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getAllSessions = async (): Promise<MenuSession[]> => {
  const { data, error } = await supabase
    .from('menu_sessions')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const updateSession = async (id: string, updates: Partial<MenuSession>): Promise<MenuSession | null> => {
  const { data, error } = await supabase
    .from('menu_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating session:', error);
    return null;
  }
  return data;
};

// Menu Item APIs
export const getAvailableMenuItems = async (): Promise<MenuItemWithSession[]> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, menu_sessions(*)')
    .eq('is_available', true)
    .gt('stock', 0)
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getAllMenuItems = async (): Promise<MenuItemWithSession[]> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, menu_sessions(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getMenuItemById = async (id: string): Promise<MenuItemWithSession | null> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, menu_sessions(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching menu item:', error);
    return null;
  }
  return data;
};

export const createMenuItem = async (item: Partial<MenuItem>): Promise<MenuItem | null> => {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(item)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating menu item:', error);
    return null;
  }
  return data;
};

export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating menu item:', error);
    return null;
  }
  return data;
};

export const deleteMenuItem = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
  return true;
};

export const getPopularItems = async (limit: number = 10) => {
  const { data, error } = await supabase
    .rpc('get_popular_items', { limit_count: limit });

  if (error) {
    console.error('Error fetching popular items:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getItemsByDay = async (dayName: string) => {
  const { data, error } = await supabase
    .rpc('get_items_by_day', { day_name: dayName });

  if (error) {
    console.error('Error fetching items by day:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getMenuItemPopularity = async () => {
  const { data, error } = await supabase
    .from('menu_item_popularity')
    .select('*')
    .order('total_orders', { ascending: false });

  if (error) {
    console.error('Error fetching menu item popularity:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

// Order APIs
export const createOrder = async (order: Partial<Order>): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating order:', error);
    throw new Error(error.message || 'Failed to create order');
  }
  
  if (!data) {
    throw new Error('No order data returned');
  }
  
  return data;
};

export const createOrderItems = async (items: Partial<OrderItem>[]): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .insert(items)
    .select();

  if (error) {
    console.error('Error creating order items:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getUserOrders = async (userId: string): Promise<OrderWithItems[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_items(*)), profiles(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getOrderById = async (orderId: string): Promise<OrderWithItems | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_items(*)), profiles(*)')
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }
  return data;
};

export const getAllOrders = async (): Promise<OrderWithItems[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_items(*)), profiles(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating order:', error);
    return null;
  }
  return data;
};

export const getTodayOrders = async (): Promise<OrderWithItems[]> => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_items(*)), profiles(*)')
    .eq('pickup_date', today)
    .order('pickup_time', { ascending: true });

  if (error) {
    console.error('Error fetching today orders:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

// Order Cancellation and Refund APIs
export const cancelOrder = async (
  orderId: string,
  userId: string,
  cancellationReason?: string
): Promise<{ success: boolean; message: string; refund_amount: number }> => {
  const { data, error } = await supabase.rpc('cancel_order', {
    p_order_id: orderId,
    p_user_id: userId,
    p_cancellation_reason: cancellationReason || null,
  });

  if (error) {
    console.error('Error cancelling order:', error);
    throw new Error(error.message || 'Failed to cancel order');
  }

  if (!data || data.length === 0) {
    throw new Error('No response from cancel order function');
  }

  return data[0];
};

export const calculateRefundAmount = async (orderId: string): Promise<number> => {
  const { data, error } = await supabase.rpc('calculate_refund_amount', {
    p_order_id: orderId,
  });

  if (error) {
    console.error('Error calculating refund:', error);
    return 0;
  }

  return data || 0;
};

export const validateCashOnPickup = async (
  orderItems: Array<{ menu_item_id: string; quantity: number }>
): Promise<{ is_valid: boolean; message: string }> => {
  const { data, error } = await supabase.rpc('validate_cash_on_pickup', {
    p_order_items: orderItems,
  });

  if (error) {
    console.error('Error validating cash on pickup:', error);
    return { is_valid: false, message: 'Validation error occurred' };
  }

  if (!data || data.length === 0) {
    return { is_valid: false, message: 'No validation response' };
  }

  return data[0];
};

// Inventory APIs
export const getAllInventory = async (): Promise<Inventory[]> => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('item_name', { ascending: true });

  if (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getLowStockItems = async (): Promise<Inventory[]> => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .lt('quantity', supabase.rpc('low_stock_threshold'))
    .order('quantity', { ascending: true });

  if (error) {
    const { data: allData } = await supabase.from('inventory').select('*');
    const lowStock = (allData || []).filter((item: Inventory) => item.quantity < item.low_stock_threshold);
    return lowStock;
  }
  return Array.isArray(data) ? data : [];
};

export const createInventoryItem = async (item: Partial<Inventory>): Promise<Inventory | null> => {
  const { data, error } = await supabase
    .from('inventory')
    .insert(item)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating inventory item:', error);
    return null;
  }
  return data;
};

export const updateInventoryItem = async (id: string, updates: Partial<Inventory>): Promise<Inventory | null> => {
  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating inventory item:', error);
    return null;
  }
  return data;
};

export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
  return true;
};

// Feedback APIs
export const createFeedback = async (feedback: Partial<Feedback>): Promise<Feedback | null> => {
  const { data, error } = await supabase
    .from('feedback')
    .insert(feedback)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating feedback:', error);
    return null;
  }
  return data;
};

export const getOrderFeedback = async (orderId: string): Promise<Feedback | null> => {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching feedback:', error);
    return null;
  }
  return data;
};

export const getAllFeedback = async (): Promise<Feedback[]> => {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

// Notification APIs
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
  return true;
};

export const createNotification = async (notification: Partial<Notification>): Promise<Notification | null> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }
  return data;
};

// Admin Log APIs
export const createAdminLog = async (log: Partial<AdminLog>): Promise<AdminLog | null> => {
  const { data, error } = await supabase
    .from('admin_logs')
    .insert(log)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating admin log:', error);
    return null;
  }
  return data;
};

export const getAdminLogs = async (limit = 100): Promise<AdminLog[]> => {
  const { data, error } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching admin logs:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

// Favorites APIs
export const getUserFavorites = async (userId: string): Promise<Favorite[]> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const addFavorite = async (userId: string, menuItemId: string): Promise<Favorite | null> => {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, menu_item_id: menuItemId })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding favorite:', error);
    return null;
  }
  return data;
};

export const removeFavorite = async (userId: string, menuItemId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('menu_item_id', menuItemId);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
  return true;
};

// Dashboard Stats
export const getDashboardStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const [ordersResult, todayOrdersResult, inventoryResult] = await Promise.all([
    supabase.from('orders').select('total_amount, status'),
    supabase.from('orders').select('total_amount, status').eq('pickup_date', today),
    supabase.from('inventory').select('quantity, low_stock_threshold'),
  ]);

  const orders = Array.isArray(ordersResult.data) ? ordersResult.data : [];
  const todayOrders = Array.isArray(todayOrdersResult.data) ? todayOrdersResult.data : [];
  const inventory = Array.isArray(inventoryResult.data) ? inventoryResult.data : [];

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const lowStockItems = inventory.filter(item => item.quantity < item.low_stock_threshold).length;

  return {
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    totalRevenue,
    todayRevenue,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    lowStockItems,
  };
};

// ==================== Pickup Slots ====================

export const getPickupSlots = async (date: string) => {
  const { data, error } = await supabase
    .from('pickup_slots')
    .select('*')
    .eq('date', date)
    .order('time_slot', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const checkSlotAvailability = async (date: string, timeSlot: string) => {
  const { data, error } = await supabase
    .rpc('check_slot_availability', {
      p_date: date,
      p_time_slot: timeSlot
    });

  if (error) throw error;
  return data && data.length > 0 ? data[0] : { available_slots: 10, max_capacity: 10, is_available: true };
};

export const updateSlotCapacity = async (slotId: string, maxCapacity: number) => {
  const { data, error } = await supabase
    .from('pickup_slots')
    .update({ max_capacity: maxCapacity } as never)
    .eq('id', slotId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createPickupSlot = async (date: string, timeSlot: string, maxCapacity: number = 10) => {
  const { data, error } = await supabase
    .from('pickup_slots')
    .insert({
      date,
      time_slot: timeSlot,
      max_capacity: maxCapacity,
      current_bookings: 0
    } as never)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const deletePickupSlot = async (slotId: string) => {
  const { error } = await supabase
    .from('pickup_slots')
    .delete()
    .eq('id', slotId);

  if (error) throw error;
  return true;
};

export const getAllPickupSlots = async (startDate?: string, endDate?: string) => {
  let query = supabase
    .from('pickup_slots')
    .select('*')
    .order('date', { ascending: true })
    .order('time_slot', { ascending: true });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};
