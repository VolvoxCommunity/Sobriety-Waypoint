/**
 * @fileoverview Tests for apple-auth-name module
 *
 * Tests the shared module for passing Apple Sign In name data between components.
 */

import {
  setPendingAppleAuthName,
  getPendingAppleAuthName,
  clearPendingAppleAuthName,
} from '@/lib/apple-auth-name';

// =============================================================================
// Test Suite
// =============================================================================

describe('apple-auth-name', () => {
  beforeEach(() => {
    // Clear any pending name data before each test
    clearPendingAppleAuthName();
  });

  describe('setPendingAppleAuthName', () => {
    it('stores name data', () => {
      const nameData = {
        firstName: 'John',
        familyName: 'Doe',
        displayName: 'John D.',
        fullName: 'John Doe',
      };

      setPendingAppleAuthName(nameData);

      expect(getPendingAppleAuthName()).toEqual(nameData);
    });

    it('overwrites previous name data', () => {
      const firstData = {
        firstName: 'John',
        familyName: 'Doe',
        displayName: 'John D.',
        fullName: 'John Doe',
      };
      const secondData = {
        firstName: 'Jane',
        familyName: 'Smith',
        displayName: 'Jane S.',
        fullName: 'Jane Smith',
      };

      setPendingAppleAuthName(firstData);
      setPendingAppleAuthName(secondData);

      expect(getPendingAppleAuthName()).toEqual(secondData);
    });
  });

  describe('getPendingAppleAuthName', () => {
    it('returns null when no name data is set', () => {
      expect(getPendingAppleAuthName()).toBeNull();
    });

    it('returns stored name data', () => {
      const nameData = {
        firstName: 'John',
        familyName: 'Doe',
        displayName: 'John D.',
        fullName: 'John Doe',
      };

      setPendingAppleAuthName(nameData);

      expect(getPendingAppleAuthName()).toEqual(nameData);
    });
  });

  describe('clearPendingAppleAuthName', () => {
    it('clears stored name data', () => {
      const nameData = {
        firstName: 'John',
        familyName: 'Doe',
        displayName: 'John D.',
        fullName: 'John Doe',
      };

      setPendingAppleAuthName(nameData);
      expect(getPendingAppleAuthName()).not.toBeNull();

      clearPendingAppleAuthName();
      expect(getPendingAppleAuthName()).toBeNull();
    });

    it('is idempotent - can be called when already cleared', () => {
      clearPendingAppleAuthName();
      clearPendingAppleAuthName();

      expect(getPendingAppleAuthName()).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles empty strings in name data', () => {
      const nameData = {
        firstName: '',
        familyName: 'Johnson',
        displayName: 'J.',
        fullName: 'Johnson',
      };

      setPendingAppleAuthName(nameData);

      expect(getPendingAppleAuthName()).toEqual(nameData);
    });

    it('handles firstName only (no family name)', () => {
      const nameData = {
        firstName: 'Madonna',
        familyName: '',
        displayName: 'Madonna',
        fullName: 'Madonna',
      };

      setPendingAppleAuthName(nameData);

      expect(getPendingAppleAuthName()).toEqual(nameData);
    });
  });
});
