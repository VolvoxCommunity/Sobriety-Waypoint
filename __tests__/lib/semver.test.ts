// __tests__/lib/semver.test.ts
import { compareSemver, sortByVersion } from '@/lib/semver';

describe('semver utilities', () => {
  describe('compareSemver', () => {
    it('returns negative when a < b', () => {
      expect(compareSemver('1.0.0', '2.0.0')).toBeLessThan(0);
      expect(compareSemver('1.0.0', '1.1.0')).toBeLessThan(0);
      expect(compareSemver('1.0.0', '1.0.1')).toBeLessThan(0);
    });

    it('returns positive when a > b', () => {
      expect(compareSemver('2.0.0', '1.0.0')).toBeGreaterThan(0);
      expect(compareSemver('1.1.0', '1.0.0')).toBeGreaterThan(0);
      expect(compareSemver('1.0.1', '1.0.0')).toBeGreaterThan(0);
    });

    it('returns zero when versions are equal', () => {
      expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
      expect(compareSemver('2.5.3', '2.5.3')).toBe(0);
    });

    it('handles versions with different segment counts', () => {
      expect(compareSemver('1.0', '1.0.0')).toBe(0);
      expect(compareSemver('1', '1.0.0')).toBe(0);
      expect(compareSemver('1.0.0', '1')).toBe(0);
    });

    it('handles double-digit version numbers correctly', () => {
      expect(compareSemver('1.10.0', '1.9.0')).toBeGreaterThan(0);
      expect(compareSemver('1.2.10', '1.2.9')).toBeGreaterThan(0);
      expect(compareSemver('10.0.0', '9.0.0')).toBeGreaterThan(0);
    });

    it('handles malformed versions gracefully', () => {
      // Malformed versions should sort to end (return positive for malformed 'a')
      expect(compareSemver('invalid', '1.0.0')).toBeGreaterThan(0);
      expect(compareSemver('1.0.0', 'invalid')).toBeLessThan(0);
      expect(compareSemver('invalid', 'invalid')).toBe(0);
    });
  });

  describe('sortByVersion', () => {
    it('sorts versions in descending order (newest first)', () => {
      const versions = ['1.0.0', '2.0.0', '1.5.0', '1.0.1'];
      const sorted = sortByVersion(versions);
      expect(sorted).toEqual(['2.0.0', '1.5.0', '1.0.1', '1.0.0']);
    });

    it('handles complex version ordering', () => {
      const versions = ['1.9.0', '1.10.0', '2.0.0', '1.2.0'];
      const sorted = sortByVersion(versions);
      expect(sorted).toEqual(['2.0.0', '1.10.0', '1.9.0', '1.2.0']);
    });

    it('returns empty array for empty input', () => {
      expect(sortByVersion([])).toEqual([]);
    });
  });
});
