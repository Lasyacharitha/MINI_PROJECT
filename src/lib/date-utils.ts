import { format, parse, isAfter, isBefore, addMinutes, differenceInMinutes } from 'date-fns';

// Format date for display
export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

// Format time for display
export const formatTime = (time: string): string => {
  try {
    const parsed = parse(time, 'HH:mm:ss', new Date());
    return format(parsed, 'hh:mm a');
  } catch {
    return time;
  }
};

// Format datetime for display
export const formatDateTime = (datetime: string | Date): string => {
  return format(new Date(datetime), 'MMM dd, yyyy hh:mm a');
};

// Get current date in YYYY-MM-DD format
export const getCurrentDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

// Get current time in HH:mm format
export const getCurrentTime = (): string => {
  return format(new Date(), 'HH:mm');
};

// Check if current time is within session time
export const isWithinSessionTime = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const start = parse(startTime, 'HH:mm:ss', now);
  const end = parse(endTime, 'HH:mm:ss', now);
  
  return isAfter(now, start) && isBefore(now, end);
};

// Check if order can be placed (considering cutoff time)
export const canPlaceOrder = (sessionStartTime: string, cutoffMinutes: number): boolean => {
  const now = new Date();
  const sessionStart = parse(sessionStartTime, 'HH:mm:ss', new Date());
  const cutoffTime = addMinutes(sessionStart, -cutoffMinutes);
  
  return isBefore(now, cutoffTime);
};

// Get time slots for a session
export const getTimeSlots = (startTime: string, endTime: string, intervalMinutes = 30): string[] => {
  const slots: string[] = [];
  const start = parse(startTime, 'HH:mm:ss', new Date());
  const end = parse(endTime, 'HH:mm:ss', new Date());
  const now = new Date();
  
  let current = start;
  while (isBefore(current, end)) {
    const slotTime = format(current, 'HH:mm');
    
    // Only include slots that are in the future (at least 30 minutes from now)
    const slotDateTime = parse(slotTime, 'HH:mm', new Date());
    const minutesUntilSlot = differenceInMinutes(slotDateTime, now);
    
    // Include slot if it's at least 30 minutes in the future
    if (minutesUntilSlot >= 30) {
      slots.push(slotTime);
    }
    
    current = addMinutes(current, intervalMinutes);
  }
  
  return slots;
};

// Check if cancellation is allowed (1-2 hours before pickup)
export const canCancelOrder = (pickupDate: string, pickupTime: string, hoursBeforePickup = 2): boolean => {
  const now = new Date();
  
  // Handle both HH:mm and HH:mm:ss formats
  const timeFormat = pickupTime.length === 8 ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd HH:mm';
  const pickup = parse(`${pickupDate} ${pickupTime}`, timeFormat, new Date());
  const minutesUntilPickup = differenceInMinutes(pickup, now);
  
  return minutesUntilPickup > (hoursBeforePickup * 60);
};

// Get day of week from date
export const getDayOfWeek = (date: string | Date): string => {
  return format(new Date(date), 'EEEE').toLowerCase();
};

// Check if item is available on given day
export const isAvailableOnDay = (availableDays: string[], date: string | Date): boolean => {
  const dayOfWeek = getDayOfWeek(date);
  return availableDays.includes(dayOfWeek);
};
