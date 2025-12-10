// =============================================================================
// Imports
// =============================================================================
import { formatProfileName } from '@/lib/format';
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
});
