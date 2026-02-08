// Validate SRIT email format
export const isValidSRITEmail = (email: string): boolean => {
  // Check if email ends with @srit.ac.in
  const sritPattern = /^[a-zA-Z0-9._-]+@srit\.ac\.in$/;
  return sritPattern.test(email);
};

// Extract username from email
export const extractUsername = (email: string): string => {
  return email.split('@')[0];
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};
