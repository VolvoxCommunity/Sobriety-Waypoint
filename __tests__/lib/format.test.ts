// =============================================================================
// Imports
// =============================================================================
import { formatProfileName, hexWithAlpha } from '@/lib/format';
import { Profile } from '@/types/database';

// =============================================================================
// Tests
// =============================================================================
describe('formatProfileName', () => {
  test('returns display name when present', () => {
    const profile: Partial<Profile> = {
      display_name: 'John D.',
    };

    const result = formatProfileName(profile);

    expect(result).toBe('John D.');
  });

  test('returns question mark when profile is null', () => {
    const result = formatProfileName(null);

    expect(result).toBe('?');
  });

  test('returns question mark when profile is undefined', () => {
    const result = formatProfileName(undefined);

    expect(result).toBe('?');
  });

  test('returns question mark when display name is missing', () => {
    const profile: Partial<Profile> = {};

    const result = formatProfileName(profile);

    expect(result).toBe('?');
  });

  test('returns question mark when display name is null', () => {
    const profile: Partial<Profile> = {
      display_name: null,
    };

    const result = formatProfileName(profile);

    expect(result).toBe('?');
  });

  test('returns question mark for empty string display name', () => {
    const profile: Partial<Profile> = {
      display_name: '',
    };

    const result = formatProfileName(profile);

    expect(result).toBe('?');
  });

  test('returns question mark for whitespace-only display name', () => {
    const profile: Partial<Profile> = {
      display_name: '   ',
    };

    const result = formatProfileName(profile);

    expect(result).toBe('?');
  });

  test('trims whitespace from display name', () => {
    const profile: Partial<Profile> = {
      display_name: '  Sarah J.  ',
    };

    const result = formatProfileName(profile);

    expect(result).toBe('Sarah J.');
  });

  describe('edge cases with special characters', () => {
    test('handles display name with only spaces and periods', () => {
      const profile: Partial<Profile> = {
        display_name: '...',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('...');
    });

    test('handles display name with only hyphens', () => {
      const profile: Partial<Profile> = {
        display_name: '---',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('---');
    });

    test('handles display name with mixed special characters', () => {
      const profile: Partial<Profile> = {
        display_name: 'Mary-Jane S.',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('Mary-Jane S.');
    });

    test('handles display name with leading period', () => {
      const profile: Partial<Profile> = {
        display_name: '.John',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('.John');
    });

    test('handles display name with trailing hyphen', () => {
      const profile: Partial<Profile> = {
        display_name: 'John-',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('John-');
    });
  });

  describe('international character handling', () => {
    test('handles Chinese characters', () => {
      const profile: Partial<Profile> = {
        display_name: '李明',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('李明');
    });

    test('handles Arabic characters', () => {
      const profile: Partial<Profile> = {
        display_name: 'محمد',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('محمد');
    });

    test('handles Cyrillic characters', () => {
      const profile: Partial<Profile> = {
        display_name: 'Иван',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('Иван');
    });

    test('handles mixed scripts', () => {
      const profile: Partial<Profile> = {
        display_name: 'John 中文',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('John 中文');
    });

    test('handles accented characters', () => {
      const profile: Partial<Profile> = {
        display_name: 'José García',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('José García');
    });
  });

  describe('whitespace edge cases', () => {
    test('trims leading whitespace', () => {
      const profile: Partial<Profile> = {
        display_name: '   John D.',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('John D.');
    });

    test('trims trailing whitespace', () => {
      const profile: Partial<Profile> = {
        display_name: 'John D.   ',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('John D.');
    });

    test('trims both leading and trailing whitespace', () => {
      const profile: Partial<Profile> = {
        display_name: '  John D.  ',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('John D.');
    });

    test('preserves internal whitespace', () => {
      const profile: Partial<Profile> = {
        display_name: 'John   D.',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('John   D.');
    });

    test('returns question mark for only whitespace after trim', () => {
      const profile: Partial<Profile> = {
        display_name: '     ',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('?');
    });
  });

  describe('length boundary cases', () => {
    test('handles maximum length display name (30 chars)', () => {
      const profile: Partial<Profile> = {
        display_name: 'A'.repeat(30),
      };

      const result = formatProfileName(profile);

      expect(result).toBe('A'.repeat(30));
    });

    test('handles minimum length display name (2 chars)', () => {
      const profile: Partial<Profile> = {
        display_name: 'Jo',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('Jo');
    });

    test('handles single character display name', () => {
      const profile: Partial<Profile> = {
        display_name: 'J',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('J');
    });
  });

  describe('type safety and nullish coalescing', () => {
    test('handles profile with only other fields', () => {
      const profile: Partial<Profile> = {
        id: '123',
        email: 'test@example.com',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('?');
    });

    test('handles empty object profile', () => {
      const profile: Partial<Profile> = {};

      const result = formatProfileName(profile);

      expect(result).toBe('?');
    });

    test('consistently returns question mark for all null-like values', () => {
      expect(formatProfileName(null)).toBe('?');
      expect(formatProfileName(undefined)).toBe('?');
      expect(formatProfileName({ display_name: null })).toBe('?');
      expect(formatProfileName({ display_name: undefined })).toBe('?');
      expect(formatProfileName({ display_name: '' })).toBe('?');
      expect(formatProfileName({ display_name: '  ' })).toBe('?');
    });
  });

  describe('real-world migration scenarios', () => {
    test('handles newly migrated profile with display name', () => {
      const profile: Partial<Profile> = {
        display_name: 'John D.',
      };

      const result = formatProfileName(profile);

      expect(result).toBe('John D.');
    });

    test('handles profile during transition (null display name)', () => {
      const profile: Partial<Profile> = {
        id: '123',
        display_name: null,
      };

      const result = formatProfileName(profile);

      expect(result).toBe('?');
    });

    test('handles various valid display name formats', () => {
      const validFormats = [
        'John D.',
        'Mary Jane',
        'Anne-Marie',
        'J.R.R. T.',
        'José García',
        "O'Brien",
      ];

      // Note: O'Brien contains apostrophe which is not in the allowed character set
      // according to validation rules, but we test formatting behavior here
      validFormats.forEach((displayName) => {
        const profile: Partial<Profile> = { display_name: displayName };
        const result = formatProfileName(profile);

        // For O'Brien, it should still format it even though it wouldn't pass validation
        expect(result).toBe(displayName);
      });
    });
  });
});

// =============================================================================
// hexWithAlpha Tests
// =============================================================================
describe('hexWithAlpha', () => {
  describe('6-digit hex colors', () => {
    test('converts 6-digit hex with alpha', () => {
      const result = hexWithAlpha('#FF5500', 0.3);
      expect(result).toBe('rgba(255, 85, 0, 0.3)');
    });

    test('handles full opacity', () => {
      const result = hexWithAlpha('#007AFF', 1);
      expect(result).toBe('rgba(0, 122, 255, 1)');
    });

    test('handles zero opacity', () => {
      const result = hexWithAlpha('#000000', 0);
      expect(result).toBe('rgba(0, 0, 0, 0)');
    });

    test('handles white color', () => {
      const result = hexWithAlpha('#FFFFFF', 0.5);
      expect(result).toBe('rgba(255, 255, 255, 0.5)');
    });

    test('handles lowercase hex', () => {
      const result = hexWithAlpha('#ff5500', 0.3);
      expect(result).toBe('rgba(255, 85, 0, 0.3)');
    });

    test('handles mixed case hex', () => {
      const result = hexWithAlpha('#Ff55Aa', 0.5);
      expect(result).toBe('rgba(255, 85, 170, 0.5)');
    });
  });

  describe('3-digit hex colors', () => {
    test('expands 3-digit hex correctly', () => {
      const result = hexWithAlpha('#F50', 0.5);
      expect(result).toBe('rgba(255, 85, 0, 0.5)');
    });

    test('handles white shorthand', () => {
      const result = hexWithAlpha('#FFF', 0.3);
      expect(result).toBe('rgba(255, 255, 255, 0.3)');
    });

    test('handles black shorthand', () => {
      const result = hexWithAlpha('#000', 0.7);
      expect(result).toBe('rgba(0, 0, 0, 0.7)');
    });

    test('handles lowercase 3-digit hex', () => {
      const result = hexWithAlpha('#abc', 0.4);
      expect(result).toBe('rgba(170, 187, 204, 0.4)');
    });
  });

  describe('8-digit hex colors (with existing alpha)', () => {
    test('extracts RGB from 8-digit hex and applies new alpha', () => {
      const result = hexWithAlpha('#FF550080', 0.3);
      expect(result).toBe('rgba(255, 85, 0, 0.3)');
    });

    test('handles full alpha 8-digit hex', () => {
      const result = hexWithAlpha('#007AFFFF', 0.5);
      expect(result).toBe('rgba(0, 122, 255, 0.5)');
    });
  });

  describe('non-hex colors (passthrough)', () => {
    test('returns rgb() unchanged', () => {
      const result = hexWithAlpha('rgb(255, 0, 0)', 0.5);
      expect(result).toBe('rgb(255, 0, 0)');
    });

    test('returns rgba() unchanged', () => {
      const result = hexWithAlpha('rgba(255, 0, 0, 0.3)', 0.5);
      expect(result).toBe('rgba(255, 0, 0, 0.3)');
    });

    test('returns named colors unchanged', () => {
      const result = hexWithAlpha('red', 0.5);
      expect(result).toBe('red');
    });

    test('returns hsl() unchanged', () => {
      const result = hexWithAlpha('hsl(0, 100%, 50%)', 0.5);
      expect(result).toBe('hsl(0, 100%, 50%)');
    });

    test('returns empty string unchanged', () => {
      const result = hexWithAlpha('', 0.5);
      expect(result).toBe('');
    });
  });

  describe('alpha clamping', () => {
    test('clamps alpha greater than 1 to 1', () => {
      const result = hexWithAlpha('#FF5500', 1.5);
      expect(result).toBe('rgba(255, 85, 0, 1)');
    });

    test('clamps alpha less than 0 to 0', () => {
      const result = hexWithAlpha('#FF5500', -0.5);
      expect(result).toBe('rgba(255, 85, 0, 0)');
    });

    test('preserves decimal precision', () => {
      const result = hexWithAlpha('#FF5500', 0.19);
      expect(result).toBe('rgba(255, 85, 0, 0.19)');
    });
  });

  describe('invalid hex handling', () => {
    test('returns invalid hex unchanged', () => {
      const result = hexWithAlpha('#GGG', 0.5);
      expect(result).toBe('#GGG');
    });

    test('returns hex with wrong length unchanged', () => {
      const result = hexWithAlpha('#FF55', 0.5);
      // This will attempt to parse and fail, returning original
      expect(result).toBe('#FF55');
    });

    test('returns hex without # unchanged', () => {
      const result = hexWithAlpha('FF5500', 0.5);
      expect(result).toBe('FF5500');
    });
  });

  describe('real-world usage', () => {
    test('creates border color with 19% opacity (0x30 = 48/255 ≈ 0.19)', () => {
      // This matches the original usage: theme.primary + '30'
      // where '30' in hex is 48, and 48/255 ≈ 0.188
      const result = hexWithAlpha('#007AFF', 0.19);
      expect(result).toBe('rgba(0, 122, 255, 0.19)');
    });

    test('creates subtle background with 10% opacity', () => {
      const result = hexWithAlpha('#FF5500', 0.1);
      expect(result).toBe('rgba(255, 85, 0, 0.1)');
    });

    test('creates semi-transparent overlay with 50% opacity', () => {
      const result = hexWithAlpha('#000000', 0.5);
      expect(result).toBe('rgba(0, 0, 0, 0.5)');
    });
  });
});
