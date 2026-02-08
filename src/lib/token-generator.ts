// Generate a unique payment token
export const generatePaymentToken = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`.toUpperCase();
};

// Generate QR code data for order
export const generateOrderQRData = (orderId: string, token: string): string => {
  return JSON.stringify({
    orderId,
    token,
    timestamp: Date.now(),
  });
};

// Verify QR code data
export const verifyOrderQRData = (qrData: string): { orderId: string; token: string } | null => {
  try {
    const data = JSON.parse(qrData);
    if (data.orderId && data.token) {
      return { orderId: data.orderId, token: data.token };
    }
    return null;
  } catch {
    return null;
  }
};
