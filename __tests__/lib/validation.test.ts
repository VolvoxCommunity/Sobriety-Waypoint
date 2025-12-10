/**
 * Tests for validation utility functions
 */

import { isValidEmail, validateDisplayName } from '@/lib/validation';

describe('validation utilities', () => {
  // =============================================================================
  // isValidEmail
  // =============================================================================
  describe('isValidEmail', () => {
    describe('valid emails', () => {
      it('should return true for standard email format', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
      });

      it('should return true for email with subdomain', () => {
        expect(isValidEmail('user@mail.example.com')).toBe(true);
      });

      it('should return true for email with plus sign', () => {
        expect(isValidEmail('user+tag@example.com')).toBe(true);
      });

      it('should return true for email with numbers', () => {
        expect(isValidEmail('user123@example123.com')).toBe(true);
      });

      it('should return true for email with dots in local part', () => {
        expect(isValidEmail('first.last@example.com')).toBe(true);
      });

      it('should return true for email with hyphen in domain', () => {
        expect(isValidEmail('user@my-domain.com')).toBe(true);
      });

      it('should return true for email with underscore in local part', () => {
        expect(isValidEmail('user_name@example.com')).toBe(true);
      });

      it('should return true for email with various TLDs', () => {
        const validEmails = [
          'user@example.org',
          'user@example.net',
          'user@example.io',
          'user@example.co.uk',
        ];
        validEmails.forEach((email) => {
          expect(isValidEmail(email)).toBe(true);
        });
      });
    });

    describe('invalid emails', () => {
      it('should return false for empty string', () => {
        expect(isValidEmail('')).toBe(false);
      });

      it('should return false for null-like values', () => {
        // TypeScript would catch this, but test runtime behavior
        expect(isValidEmail(null as unknown as string)).toBe(false);
        expect(isValidEmail(undefined as unknown as string)).toBe(false);
      });

      it('should return false for email without @ symbol', () => {
        expect(isValidEmail('userexample.com')).toBe(false);
      });

      it('should return false for email without domain', () => {
        expect(isValidEmail('user@')).toBe(false);
      });

      it('should return false for email without local part', () => {
        expect(isValidEmail('@example.com')).toBe(false);
      });

      it('should return false for email without TLD', () => {
        expect(isValidEmail('user@example')).toBe(false);
      });

      it('should return false for email with spaces', () => {
        expect(isValidEmail('user @example.com')).toBe(false);
        expect(isValidEmail('user@ example.com')).toBe(false);
        expect(isValidEmail(' user@example.com')).toBe(false);
        expect(isValidEmail('user@example.com ')).toBe(false);
      });

      it('should return false for email with multiple @ symbols', () => {
        expect(isValidEmail('user@@example.com')).toBe(false);
        expect(isValidEmail('user@domain@example.com')).toBe(false);
      });

      it('should return false for plain text', () => {
        expect(isValidEmail('not an email')).toBe(false);
        expect(isValidEmail('justastring')).toBe(false);
      });
    });
  });

  // =============================================================================
  // validateDisplayName
  // =============================================================================
  describe('validateDisplayName', () => {
    describe('valid names', () => {
      it('accepts standard names', () => {
        expect(validateDisplayName('John D.')).toBeNull();
        expect(validateDisplayName('Mary Jane')).toBeNull();
        expect(validateDisplayName('Anne-Marie')).toBeNull();
      });

      it('accepts names with international characters', () => {
        expect(validateDisplayName('José')).toBeNull();
        expect(validateDisplayName('Müller')).toBeNull();
        expect(validateDisplayName('中文名字')).toBeNull();
      });

      it('accepts minimum length (2 chars)', () => {
        expect(validateDisplayName('Jo')).toBeNull();
      });

      it('accepts maximum length (30 chars)', () => {
        expect(validateDisplayName('A'.repeat(30))).toBeNull();
      });
    });

    describe('invalid names', () => {
      it('rejects empty string', () => {
        expect(validateDisplayName('')).toBe('Display name is required');
      });

      it('rejects whitespace-only', () => {
        expect(validateDisplayName('   ')).toBe('Display name is required');
      });

      it('rejects too short (1 char)', () => {
        expect(validateDisplayName('J')).toBe('Display name must be at least 2 characters');
      });

      it('rejects too long (31+ chars)', () => {
        expect(validateDisplayName('A'.repeat(31))).toBe(
          'Display name must be 30 characters or less'
        );
      });

      it('rejects numbers', () => {
        expect(validateDisplayName('John123')).toBe(
          'Display name can only contain letters, spaces, periods, and hyphens'
        );
      });

      it('rejects special characters', () => {
        expect(validateDisplayName('John@Doe')).toBe(
          'Display name can only contain letters, spaces, periods, and hyphens'
        );
      });

      it('rejects emojis', () => {
        expect(validateDisplayName('John 😀')).toBe(
          'Display name can only contain letters, spaces, periods, and hyphens'
        );
      });
    });

    describe('edge cases', () => {
      it('trims whitespace before validation', () => {
        expect(validateDisplayName('  John D.  ')).toBeNull();
      });

      it('counts trimmed length', () => {
        expect(validateDisplayName('  J  ')).toBe('Display name must be at least 2 characters');
      });
    });
  });
});
