// =============================================================================
// Imports
// =============================================================================
import { formatSponseeName } from './format';
import { Profile } from '@/types/database';

// =============================================================================
// Tests
// =============================================================================
describe('formatSponseeName', () => {
  test('formats full name with first name and last initial', () => {
    const sponsee: Partial<Profile> = {
      first_name: 'John',
      last_initial: 'D',
    };

    const result = formatSponseeName(sponsee);

    expect(result).toBe('John D.');
  });

  test('formats name with only first name when last initial is missing', () => {
    const sponsee: Partial<Profile> = {
      first_name: 'Jane',
      last_initial: null,
    };

    const result = formatSponseeName(sponsee);

    expect(result).toBe('Jane');
  });

  test('handles undefined last initial', () => {
    const sponsee: Partial<Profile> = {
      first_name: 'Bob',
    };

    const result = formatSponseeName(sponsee);

    expect(result).toBe('Bob');
  });

  test('returns question mark when sponsee is null', () => {
    const result = formatSponseeName(null);

    expect(result).toBe('?');
  });

  test('returns question mark when sponsee is undefined', () => {
    const result = formatSponseeName(undefined);

    expect(result).toBe('?');
  });

  test('returns question mark when first name is missing', () => {
    const sponsee: Partial<Profile> = {
      last_initial: 'S',
    };

    const result = formatSponseeName(sponsee);

    expect(result).toBe('?');
  });

  test('handles empty string first name', () => {
    const sponsee: Partial<Profile> = {
      first_name: '',
      last_initial: 'D',
    };

    const result = formatSponseeName(sponsee);

    expect(result).toBe('?');
  });

  test('trims whitespace from first name', () => {
    const sponsee: Partial<Profile> = {
      first_name: '  Sarah  ',
      last_initial: 'J',
    };

    const result = formatSponseeName(sponsee);

    expect(result).toBe('Sarah J.');
  });
});
