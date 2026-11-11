import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateFullName,
  validateStudentId,
  validateCourse,
  validatePhone,
  validateEmail,
  validatePhotoFile,
  validateCardForm,
  formatDateDisplay,
  formatPhoneDisplay,
  buildQRContent
} from '../src/utils/validation.ts';

test('Full name validation requires at least 2 chars and letters', () => {
  assert.equal(validateFullName('').valid, false);
  assert.equal(validateFullName('A').valid, false);
  assert.equal(validateFullName('Jane Doe').valid, true);
  assert.equal(validateFullName('John O\'Connor-Smith Jr.').valid, true);
});

test('Student ID validation requires at least 3 chars alphanumeric', () => {
  assert.equal(validateStudentId('').valid, false);
  assert.equal(validateStudentId('12').valid, false);
  assert.equal(validateStudentId('CS-2026-894').valid, true);
  assert.equal(validateStudentId('STU/9901').valid, true);
});

test('Course validation requires non-empty course', () => {
  assert.equal(validateCourse('').valid, false);
  assert.equal(validateCourse('B.Sc. Computer Science').valid, true);
});

test('Phone validation checks 10 digits when provided', () => {
  // Empty is valid (optional field)
  assert.equal(validatePhone('').valid, true);
  // Less than 10 digits is invalid
  assert.equal(validatePhone('12345').valid, false);
  assert.equal(validatePhone('987654321').valid, false);
  // Exactly 10 digits is valid, even with formatting
  assert.equal(validatePhone('9876543210').valid, true);
  assert.equal(validatePhone('(987) 654-3210').valid, true);
  assert.equal(validatePhone('987-654-3210').valid, true);
  // More than 10 digits is invalid
  assert.equal(validatePhone('19876543210').valid, false);
});

test('Email validation checks standard format when provided', () => {
  assert.equal(validateEmail('').valid, true);
  assert.equal(validateEmail('not-an-email').valid, false);
  assert.equal(validateEmail('user@').valid, false);
  assert.equal(validateEmail('student@university.edu').valid, true);
});

test('Photo file validation checks 2MB limit and image type', () => {
  assert.equal(validatePhotoFile({ size: 1000, type: 'text/plain' }).valid, false);
  assert.equal(validatePhotoFile({ size: 3 * 1024 * 1024, type: 'image/jpeg' }).valid, false);
  assert.equal(validatePhotoFile({ size: 1.5 * 1024 * 1024, type: 'image/png' }).valid, true);
});

test('validateCardForm checks required fields and returns errors map', () => {
  const invalidResult = validateCardForm({
    fullName: '',
    studentId: '',
    course: '',
    phone: '123'
  });
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.fullName);
  assert.ok(invalidResult.errors.studentId);
  assert.ok(invalidResult.errors.course);
  assert.ok(invalidResult.errors.phone);

  const validResult = validateCardForm({
    fullName: 'Sophia Martinez',
    studentId: 'ENG-2026-440',
    course: 'Mechanical Engineering',
    phone: '5551234567',
    email: 'sophia.m@campus.edu'
  });
  assert.equal(validResult.isValid, true);
  assert.deepEqual(validResult.errors, {});
});

test('formatDateDisplay formats YYYY-MM-DD properly', () => {
  assert.equal(formatDateDisplay(''), '—');
  assert.equal(formatDateDisplay('2028-06-30'), 'Jun 30, 2028');
  assert.equal(formatDateDisplay('2003-11-15'), 'Nov 15, 2003');
});

test('formatPhoneDisplay formats 10-digit number nicely', () => {
  assert.equal(formatPhoneDisplay(''), '—');
  assert.equal(formatPhoneDisplay('5551234567'), '+1 (555) 123-4567');
});

test('buildQRContent generates structured QR data string', () => {
  const qrString = buildQRContent({
    studentId: 'STU-9921',
    fullName: 'Alex Vance',
    course: 'Robotics',
    institution: 'Tech Institute'
  });
  assert.ok(qrString.includes('STU-9921'));
  assert.ok(qrString.includes('Alex Vance'));
});
