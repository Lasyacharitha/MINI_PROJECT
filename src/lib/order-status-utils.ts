// Order status display helpers

export const getOrderStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    pending: 'Not Yet Started Preparing',
    confirmed: 'Confirmed',
    preparing: 'Preparation Started',
    ready: 'Ready for Pickup',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return statusLabels[status] || status;
};

export const getOrderStatusDescription = (status: string): string => {
  const descriptions: Record<string, string> = {
    pending: 'Your order has been received and is waiting to be prepared',
    confirmed: 'Your order has been confirmed',
    preparing: 'The kitchen is currently preparing your order',
    ready: 'Your order is ready for pickup',
    completed: 'Order has been picked up',
    cancelled: 'This order has been cancelled',
  };

  return descriptions[status] || '';
};

export const isPreparationStarted = (status: string): boolean => {
  return ['preparing', 'ready'].includes(status);
};

export const canOrderBeCancelled = (status: string): boolean => {
  return ['pending', 'preparing'].includes(status);
};
