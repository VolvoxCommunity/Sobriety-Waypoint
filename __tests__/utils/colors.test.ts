/**
 * Tests for color utility functions
 */

import { withOpacity } from '@/utils/colors';

describe('color utilities', () => {
  // =============================================================================
  // withOpacity
  // =============================================================================
  describe('withOpacity', () => {
    describe('valid hex colors', () => {
      it('should add opacity to hex color with # prefix', () => {
        const result = withOpacity('#007AFF', 0.2);
        expect(result).toBe('rgba(0, 122, 255, 0.2)');
      });

      it('should add opacity to hex color without # prefix', () => {
        const result = withOpacity('007AFF', 0.5);
        expect(result).toBe('rgba(0, 122, 255, 0.5)');
      });

      it('should handle opacity of 0', () => {
        const result = withOpacity('#FF0000', 0);
        expect(result).toBe('rgba(255, 0, 0, 0)');
      });

      it('should handle opacity of 1', () => {
        const result = withOpacity('#00FF00', 1);
        expect(result).toBe('rgba(0, 255, 0, 1)');
      });

      it('should handle various hex colors', () => {
        expect(withOpacity('#000000', 0.3)).toBe('rgba(0, 0, 0, 0.3)');
        expect(withOpacity('#FFFFFF', 0.7)).toBe('rgba(255, 255, 255, 0.7)');
        expect(withOpacity('#FF5733', 0.15)).toBe('rgba(255, 87, 51, 0.15)');
      });
    });

    describe('opacity clamping', () => {
      it('should clamp opacity values greater than 1 to 1', () => {
        const result = withOpacity('#007AFF', 1.5);
        expect(result).toBe('rgba(0, 122, 255, 1)');
      });

      it('should clamp opacity values less than 0 to 0', () => {
        const result = withOpacity('#007AFF', -0.5);
        expect(result).toBe('rgba(0, 122, 255, 0)');
      });

      it('should handle very large opacity values', () => {
        const result = withOpacity('#007AFF', 100);
        expect(result).toBe('rgba(0, 122, 255, 1)');
      });

      it('should handle very negative opacity values', () => {
        const result = withOpacity('#007AFF', -100);
        expect(result).toBe('rgba(0, 122, 255, 0)');
      });
    });

    describe('edge cases', () => {
      it('should handle decimal opacity values', () => {
        const result = withOpacity('#007AFF', 0.123456);
        expect(result).toBe('rgba(0, 122, 255, 0.123456)');
      });

      it('should handle uppercase hex colors', () => {
        const result = withOpacity('#ABCDEF', 0.5);
        expect(result).toBe('rgba(171, 205, 239, 0.5)');
      });

      it('should handle lowercase hex colors', () => {
        const result = withOpacity('#abcdef', 0.5);
        expect(result).toBe('rgba(171, 205, 239, 0.5)');
      });

      it('should expand short hex colors (3 characters)', () => {
        const result = withOpacity('#FFF', 0.5);
        expect(result).toBe('rgba(255, 255, 255, 0.5)');
      });

      it('should expand short hex colors without # prefix', () => {
        const result = withOpacity('ABC', 0.3);
        expect(result).toBe('rgba(170, 187, 204, 0.3)');
      });

      it('should return original color for invalid hex input', () => {
        const invalidColor = '#GGGGGG';
        const result = withOpacity(invalidColor, 0.5);
        expect(result).toBe(invalidColor);
      });

      it('should return original color for empty hex input', () => {
        const invalidColor = '';
        const result = withOpacity(invalidColor, 0.5);
        expect(result).toBe(invalidColor);
      });

      it('should return original color for too short hex input', () => {
        const invalidColor = '#AB';
        const result = withOpacity(invalidColor, 0.5);
        expect(result).toBe(invalidColor);
      });
    });
  });
});
