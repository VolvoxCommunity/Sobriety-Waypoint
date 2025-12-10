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

  describe('validation', () => {
    it('throws TypeError when data is null', () => {
      expect(() => {
        setPendingAppleAuthName(null as unknown as Parameters<typeof setPendingAppleAuthName>[0]);
      }).toThrow(TypeError);
      expect(() => {
        setPendingAppleAuthName(null as unknown as Parameters<typeof setPendingAppleAuthName>[0]);
      }).toThrow('data must be a non-null object');
    });

    it('throws TypeError when data is undefined', () => {
      expect(() => {
        setPendingAppleAuthName(
          undefined as unknown as Parameters<typeof setPendingAppleAuthName>[0]
        );
      }).toThrow(TypeError);
      expect(() => {
        setPendingAppleAuthName(
          undefined as unknown as Parameters<typeof setPendingAppleAuthName>[0]
        );
      }).toThrow('data must be a non-null object');
    });

    it('throws TypeError when data is an array', () => {
      expect(() => {
        setPendingAppleAuthName([] as unknown as Parameters<typeof setPendingAppleAuthName>[0]);
      }).toThrow(TypeError);
    });

    it('throws TypeError when data is not an object', () => {
      expect(() => {
        setPendingAppleAuthName(
          'string' as unknown as Parameters<typeof setPendingAppleAuthName>[0]
        );
      }).toThrow(TypeError);
      expect(() => {
        setPendingAppleAuthName(123 as unknown as Parameters<typeof setPendingAppleAuthName>[0]);
      }).toThrow(TypeError);
    });

    it('throws TypeError when firstName is empty string', () => {
      const nameData = {
        firstName: '',
        familyName: 'Johnson',
        displayName: 'J.',
        fullName: 'Johnson',
      };

      expect(() => {
        setPendingAppleAuthName(nameData);
      }).toThrow(TypeError);
      expect(() => {
        setPendingAppleAuthName(nameData);
      }).toThrow('invalid or empty string properties');
    });

    it('throws TypeError when firstName is null', () => {
      const nameData = {
        firstName: null as unknown as string,
        familyName: 'Johnson',
        displayName: 'J.',
        fullName: 'Johnson',
      };

      expect(() => {
        setPendingAppleAuthName(nameData);
      }).toThrow(TypeError);
    });

    it('throws TypeError when firstName is undefined', () => {
      const nameData = {
        firstName: undefined as unknown as string,
        familyName: 'Johnson',
        displayName: 'J.',
        fullName: 'Johnson',
      };

      expect(() => {
        setPendingAppleAuthName(nameData);
      }).toThrow(TypeError);
    });

    it('throws TypeError when any required field is empty string', () => {
      const testCases = [
        { field: 'familyName', value: '' },
        { field: 'displayName', value: '' },
        { field: 'fullName', value: '' },
      ];

      testCases.forEach(({ field, value }) => {
        const nameData = {
          firstName: 'John',
          familyName: 'Doe',
          displayName: 'John D.',
          fullName: 'John Doe',
          [field]: value,
        };

        expect(() => {
          setPendingAppleAuthName(nameData);
        }).toThrow(TypeError);
      });
    });

    it('throws TypeError when any required field is whitespace-only', () => {
      const nameData = {
        firstName: '   ',
        familyName: 'Doe',
        displayName: 'John D.',
        fullName: 'John Doe',
      };

      expect(() => {
        setPendingAppleAuthName(nameData);
      }).toThrow(TypeError);
    });

    it('accepts valid name data with all required fields', () => {
      const nameData = {
        firstName: 'John',
        familyName: 'Doe',
        displayName: 'John D.',
        fullName: 'John Doe',
      };

      expect(() => {
        setPendingAppleAuthName(nameData);
      }).not.toThrow();
      expect(getPendingAppleAuthName()).toEqual(nameData);
    });

    it('accepts name data with single character names', () => {
      const nameData = {
        firstName: 'J',
        familyName: 'D',
        displayName: 'J D',
        fullName: 'J D',
      };

      expect(() => {
        setPendingAppleAuthName(nameData);
      }).not.toThrow();
      expect(getPendingAppleAuthName()).toEqual(nameData);
    });
  });
});
