// Trinfra — Form Validation Utilities

export interface ValidationResult {
  valid: boolean;
  message: string;
}

const OK: ValidationResult = { valid: true, message: '' };

/**
 * Validate Indian mobile phone number.
 * Accepts: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
 */
export function validatePhone(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, message: 'Phone number is required.' };
  const cleaned = value.replace(/[\s\-()]/g, '');
  const pattern = /^(\+?91|0)?[6-9]\d{9}$/;
  if (!pattern.test(cleaned)) {
    return { valid: false, message: 'Please enter a valid Indian mobile number.' };
  }
  return OK;
}

/**
 * Validate email address.
 */
export function validateEmail(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, message: 'Email address is required.' };
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value.trim())) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return OK;
}

/**
 * Validate land area — must be a positive number.
 */
export function validateLandArea(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, message: 'Approximate land area is required.' };
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return { valid: false, message: 'Please enter a valid land area greater than 0.' };
  }
  if (num > 100000) {
    return { valid: false, message: 'Please verify — area seems unusually large.' };
  }
  return OK;
}

/**
 * Validate an uploaded file: type whitelist + size limit.
 */
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 3;

export function validateFile(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: `"${file.name}" is not supported. Use PDF, JPG, PNG, or DOCX.`,
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `"${file.name}" exceeds the 5 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
    };
  }
  return OK;
}

export function validateFileCount(count: number): ValidationResult {
  if (count > MAX_FILES) {
    return { valid: false, message: `You can upload a maximum of ${MAX_FILES} files.` };
  }
  return OK;
}

/**
 * Validate a required text field.
 */
export function validateRequired(value: string, fieldName?: string): ValidationResult {
  if (!value || !value.trim()) {
    return { valid: false, message: `${fieldName || 'This field'} is required.` };
  }
  return OK;
}

/**
 * Validate a required selection.
 */
export function validateSelection(value: string, fieldName?: string): ValidationResult {
  if (!value) {
    return { valid: false, message: `Please select ${fieldName || 'an option'}.` };
  }
  return OK;
}

export { MAX_FILE_SIZE, MAX_FILES, ALLOWED_TYPES };
