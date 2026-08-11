import type { ShippingAddress } from '@/types';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Indian mobile numbers are 10 digits and always start 6-9. We accept input
 * with spaces, dashes and a +91 / 0 prefix, then validate the bare 10 digits.
 */
export function normaliseMobile(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export function isValidMobile(input: string): boolean {
  return /^[6-9]\d{9}$/.test(normaliseMobile(input));
}

/**
 * Indian PIN codes are 6 digits and never begin with 0 — the first digit is the
 * postal zone, 1 through 8.
 */
export function isValidPincode(input: string): boolean {
  return /^[1-8]\d{5}$/.test(input.trim());
}

export function isValidEmail(input: string): boolean {
  const value = input.trim();
  // Deliberately permissive: reject the obviously broken, not the unusual.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function validateAddress(address: ShippingAddress): FieldErrors<ShippingAddress> {
  const errors: FieldErrors<ShippingAddress> = {};

  if (address.fullName.trim().length < 2) {
    errors.fullName = 'Please enter the full name for delivery.';
  }
  if (!isValidMobile(address.mobile)) {
    errors.mobile = 'Enter a 10-digit Indian mobile number starting 6, 7, 8 or 9.';
  }
  if (!isValidEmail(address.email)) {
    errors.email = 'We need a valid email to send your order confirmation.';
  }
  if (address.addressLine1.trim().length < 4) {
    errors.addressLine1 = 'Enter your flat, house or building.';
  }
  if (address.addressLine2.trim().length < 3) {
    errors.addressLine2 = 'Enter the area, street or locality.';
  }
  if (address.city.trim().length < 2) {
    errors.city = 'Enter your town or city.';
  }
  if (!address.state) {
    errors.state = 'Select your state.';
  }
  if (!isValidPincode(address.pincode)) {
    errors.pincode = 'Enter a valid 6-digit PIN code.';
  }

  return errors;
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}
