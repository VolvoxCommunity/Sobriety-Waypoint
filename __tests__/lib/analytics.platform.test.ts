/**
 * Tests for the fallback analytics platform implementation.
 *
 * This file tests the no-op fallback implementation used when
 * neither web nor native platform files are applicable.
 */

import {
  initializePlatformAnalytics,
  trackEventPlatform,
  setUserIdPlatform,
  setUserPropertiesPlatform,
  trackScreenViewPlatform,
  resetAnalyticsPlatform,
} from '@/lib/analytics/platform';

const mockLoggerWarn = jest.fn();

jest.mock('@/lib/logger', () => ({
  logger: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
  },
  LogCategory: {
    ANALYTICS: 'ANALYTICS',
  },
}));

describe('Fallback Analytics Platform', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializePlatformAnalytics', () => {
    it('logs a warning about using fallback implementation', async () => {
      await initializePlatformAnalytics();

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'Analytics: Using fallback implementation (platform not supported)',
        expect.objectContaining({ category: 'ANALYTICS' })
      );
    });

    it('accepts optional config parameter', async () => {
      const config = {
        apiKey: 'test-key',
        projectId: 'test-project',
        appId: 'test-app',
        measurementId: 'G-TEST',
      };

      await expect(initializePlatformAnalytics(config)).resolves.not.toThrow();
    });
  });

  describe('trackEventPlatform', () => {
    it('is a no-op that does not throw', () => {
      expect(() => trackEventPlatform('test_event')).not.toThrow();
    });

    it('accepts event name and params', () => {
      expect(() => trackEventPlatform('test_event', { param1: 'value1' })).not.toThrow();
    });
  });

  describe('setUserIdPlatform', () => {
    it('is a no-op that does not throw with string', () => {
      expect(() => setUserIdPlatform('user-123')).not.toThrow();
    });

    it('is a no-op that does not throw with null', () => {
      expect(() => setUserIdPlatform(null)).not.toThrow();
    });
  });

  describe('setUserPropertiesPlatform', () => {
    it('is a no-op that does not throw', () => {
      expect(() => setUserPropertiesPlatform({ theme_preference: 'dark' })).not.toThrow();
    });
  });

  describe('trackScreenViewPlatform', () => {
    it('is a no-op that does not throw with screen name only', () => {
      expect(() => trackScreenViewPlatform('HomeScreen')).not.toThrow();
    });

    it('is a no-op that does not throw with screen name and class', () => {
      expect(() => trackScreenViewPlatform('HomeScreen', 'TabScreen')).not.toThrow();
    });
  });

  describe('resetAnalyticsPlatform', () => {
    it('is a no-op that resolves without throwing', async () => {
      await expect(resetAnalyticsPlatform()).resolves.not.toThrow();
    });
  });
});
