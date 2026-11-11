/**
 * Pure validation and data formatting logic for IDify
 * Decoupled for testability and reusability
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateFullName(name: string): { valid: boolean; message?: string } {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Full Name is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters.' };
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { valid: false, message: 'Name should only contain letters and standard punctuation.' };
  }
  return { valid: true };
}

export function validateStudentId(id: string): { valid: boolean; message?: string } {
  const trimmed = (id || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Student ID / Roll Number is required.' };
  }
  if (trimmed.length < 3) {
    return { valid: false, message: 'Student ID must be at least 3 characters.' };
  }
  if (!/^[a-zA-Z0-9/_-]+$/.test(trimmed)) {
    return { valid: false, message: 'ID should contain alphanumeric characters, hyphens or slashes.' };
  }
  return { valid: true };
}

export function validateCourse(course: string): { valid: boolean; message?: string } {
  const trimmed = (course || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Course / Program is required.' };
  }
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; message?: string } {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return { valid: true }; // optional, but if entered, must be valid
  }
  // Strip non-digits to test 10-digit requirement
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 10) {
    return { valid: false, message: 'Phone number must be exactly 10 digits.' };
  }
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; message?: string } {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return { valid: true }; // optional, but if entered, must be valid
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

export function validatePhotoFile(file: { size: number; type: string }): { valid: boolean; message?: string } {
  const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
  if (!file.type.startsWith('image/')) {
    return { valid: false, message: 'File must be an image (PNG, JPG, WebP, etc.).' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, message: 'Image size must be less than 2 MB.' };
  }
  return { valid: true };
}

export function validateCardForm(data: Record<string, string>): ValidationResult {
  const errors: Record<string, string> = {};

  const nameCheck = validateFullName(data.fullName);
  if (!nameCheck.valid && nameCheck.message) errors.fullName = nameCheck.message;

  const idCheck = validateStudentId(data.studentId);
  if (!idCheck.valid && idCheck.message) errors.studentId = idCheck.message;

  const courseCheck = validateCourse(data.course);
  if (!courseCheck.valid && courseCheck.message) errors.course = courseCheck.message;

  if (data.phone) {
    const phoneCheck = validatePhone(data.phone);
    if (!phoneCheck.valid && phoneCheck.message) errors.phone = phoneCheck.message;
  }

  if (data.email) {
    const emailCheck = validateEmail(data.email);
    if (!emailCheck.valid && emailCheck.message) errors.email = emailCheck.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${monthName} ${parseInt(day, 10)}, ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatPhoneDisplay(phoneStr: string): string {
  if (!phoneStr) return '—';
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phoneStr;
}

export function buildQRContent(student: {
  studentId: string;
  fullName: string;
  course?: string;
  institution?: string;
  validUntil?: string;
}): string {
  const name = (student.fullName || '').trim() || 'Student Name';
  const id = (student.studentId || '').trim() || 'N/A';
  return `Student Name: ${name}\nStudent ID: ${id}`;
}
