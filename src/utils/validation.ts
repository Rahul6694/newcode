/**
 * Validation utilities for the Atce Driver App
 */

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength
 */
export const isValidPassword = (password: string): boolean => {
  // At least 6 characters
  return password.length >= 6;
};

/**
 * Validates phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic phone number validation (digits, spaces, dashes, parentheses, plus)
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Validates if both email and password are provided and valid
 */
export const validateLoginCredentials = (
  email: string,
  password: string
): {isValid: boolean; error?: string} => {
  if (!email.trim()) {
    return {isValid: false, error: 'Email is required'};
  }
  
  if (!password.trim()) {
    return {isValid: false, error: 'Password is required'};
  }
  
  if (!isValidEmail(email)) {
    return {isValid: false, error: 'Please enter a valid email address'};
  }
  
  if (!isValidPassword(password)) {
    return {isValid: false, error: 'Password must be at least 6 characters'};
  }
  
  return {isValid: true};
};

/**
 * Validates password change requirements
 */
export const validatePasswordChange = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): {isValid: boolean; error?: string} => {
  if (!currentPassword.trim()) {
    return {isValid: false, error: 'Current password is required'};
  }
  
  if (!newPassword.trim()) {
    return {isValid: false, error: 'New password is required'};
  }
  
  if (!confirmPassword.trim()) {
    return {isValid: false, error: 'Please confirm your new password'};
  }
  
  if (!isValidPassword(newPassword)) {
    return {isValid: false, error: 'New password must be at least 6 characters'};
  }
  
  if (newPassword !== confirmPassword) {
    return {isValid: false, error: 'New passwords do not match'};
  }
  
  if (currentPassword === newPassword) {
    return {isValid: false, error: 'New password must be different from current password'};
  }
  
  return {isValid: true};
};