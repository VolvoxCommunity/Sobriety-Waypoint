// __tests__/lib/analytics-utils.test.ts
import { Platform } from 'react-native';

import {
  sanitizeParams,
  calculateDaysSoberBucket,
  shouldInitializeAnalytics,
  isDebugMode,
  getAnalyticsEnvironment,
} from '@/lib/analytics-utils';
import type { DaysSoberBucket } from '@/types/analytics';

// Store original Platform.OS to restore after tests
const originalPlatformOS = Platform.OS;

describe('Analytics Utilities', () => {
  describe('sanitizeParams', () => {
    it('passes through valid parameters unchanged', () => {
      const params = {
        task_id: '123',
        count: 5,
        is_active: true,
      };
      expect(sanitizeParams(params)).toEqual(params);
    });

    it('strips email field from parameters', () => {
      const params = {
        task_id: '123',
        email: 'user@example.com',
      };
      expect(sanitizeParams(params)).toEqual({ task_id: '123' });
    });

    it('strips all PII fields', () => {
      const params = {
        task_id: '123',
        email: 'user@example.com',
        name: 'John Doe',
        display_name: 'John D.',
        phone: '555-1234',
        password: 'secret',
        token: 'abc123',
      };
      expect(sanitizeParams(params)).toEqual({ task_id: '123' });
    });

    it('handles undefined values', () => {
      const params = {
        task_id: '123',
        optional: undefined,
      };
      expect(sanitizeParams(params)).toEqual({
        task_id: '123',
        optional: undefined,
      });
    });

    it('returns empty object for empty input', () => {
      expect(sanitizeParams({})).toEqual({});
    });

    it('returns empty object for undefined input', () => {
      expect(sanitizeParams(undefined)).toEqual({});
    });
  });

  describe('calculateDaysSoberBucket', () => {
    it('returns "0-7" for 0 days', () => {
      expect(calculateDaysSoberBucket(0)).toBe('0-7');
    });

    it('returns "0-7" for 7 days', () => {
      expect(calculateDaysSoberBucket(7)).toBe('0-7');
    });

    it('returns "8-30" for 8 days', () => {
      expect(calculateDaysSoberBucket(8)).toBe('8-30');
    });

    it('returns "8-30" for 30 days', () => {
      expect(calculateDaysSoberBucket(30)).toBe('8-30');
    });

    it('returns "31-90" for 31 days', () => {
      expect(calculateDaysSoberBucket(31)).toBe('31-90');
    });

    it('returns "31-90" for 90 days', () => {
      expect(calculateDaysSoberBucket(90)).toBe('31-90');
    });

    it('returns "91-180" for 91 days', () => {
      expect(calculateDaysSoberBucket(91)).toBe('91-180');
    });

    it('returns "91-180" for 180 days', () => {
      expect(calculateDaysSoberBucket(180)).toBe('91-180');
    });

    it('returns "181-365" for 181 days', () => {
      expect(calculateDaysSoberBucket(181)).toBe('181-365');
    });

    it('returns "181-365" for 365 days', () => {
      expect(calculateDaysSoberBucket(365)).toBe('181-365');
    });

    it('returns "365+" for 366 days', () => {
      expect(calculateDaysSoberBucket(366)).toBe('365+');
    });

    it('returns "365+" for 1000 days', () => {
      expect(calculateDaysSoberBucket(1000)).toBe('365+');
    });

    it('handles negative days as "0-7"', () => {
      expect(calculateDaysSoberBucket(-5)).toBe('0-7');
    });
  });

  describe('shouldInitializeAnalytics', () => {
    const originalEnv = process.env;

    afterEach(() => {
      // Restore Platform.OS after each test
      (Platform as { OS: string }).OS = originalPlatformOS;
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    describe('on native platforms (iOS/Android)', () => {
      it('returns true on iOS regardless of env vars', () => {
        (Platform as { OS: string }).OS = 'ios';
        const originalValue = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        delete process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;

        expect(shouldInitializeAnalytics()).toBe(true);

        // Restore
        if (originalValue !== undefined) {
          process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = originalValue;
        }
      });

      it('returns true on Android regardless of env vars', () => {
        (Platform as { OS: string }).OS = 'android';
        const originalValue = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        delete process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;

        expect(shouldInitializeAnalytics()).toBe(true);

        // Restore
        if (originalValue !== undefined) {
          process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = originalValue;
        }
      });
    });

    describe('on web platform', () => {
      beforeEach(() => {
        (Platform as { OS: string }).OS = 'web';
      });

      it('returns true when Firebase measurement ID is set', () => {
        const originalValue = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = 'G-XXXXXXXX';

        expect(shouldInitializeAnalytics()).toBe(true);

        // Restore original value
        if (originalValue === undefined) {
          delete process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        } else {
          process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = originalValue;
        }
      });

      it('returns false when Firebase measurement ID is missing', () => {
        const originalValue = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        delete process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;

        expect(shouldInitializeAnalytics()).toBe(false);

        // Restore original value
        if (originalValue !== undefined) {
          process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = originalValue;
        }
      });

      it('returns false when Firebase measurement ID is empty string', () => {
        const originalValue = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = '';

        expect(shouldInitializeAnalytics()).toBe(false);

        // Restore original value
        if (originalValue === undefined) {
          delete process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        } else {
          process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = originalValue;
        }
      });
    });
  });

  describe('isDebugMode', () => {
    it('returns false when __DEV__ is false and no env var set', () => {
      const originalValue = process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      delete process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;

      // __DEV__ is false in Jest test environment
      expect(isDebugMode()).toBe(false);

      // Restore
      if (originalValue !== undefined) {
        process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = originalValue;
      }
    });

    it('returns true when EXPO_PUBLIC_ANALYTICS_DEBUG is set to true', () => {
      const originalValue = process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = 'true';

      expect(isDebugMode()).toBe(true);

      // Restore
      if (originalValue === undefined) {
        delete process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      } else {
        process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = originalValue;
      }
    });

    it('returns false when EXPO_PUBLIC_ANALYTICS_DEBUG is not "true"', () => {
      const originalValue = process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = 'false';

      expect(isDebugMode()).toBe(false);

      // Restore
      if (originalValue === undefined) {
        delete process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      } else {
        process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = originalValue;
      }
    });
  });

  describe('getAnalyticsEnvironment', () => {
    it('returns production when __DEV__ is false and no env var', () => {
      const originalValue = process.env.EXPO_PUBLIC_APP_ENV;
      delete process.env.EXPO_PUBLIC_APP_ENV;

      // __DEV__ is false in Jest, so it returns the env var or 'production'
      expect(getAnalyticsEnvironment()).toBe('production');

      // Restore
      if (originalValue !== undefined) {
        process.env.EXPO_PUBLIC_APP_ENV = originalValue;
      }
    });

    it('returns EXPO_PUBLIC_APP_ENV when set', () => {
      const originalValue = process.env.EXPO_PUBLIC_APP_ENV;
      process.env.EXPO_PUBLIC_APP_ENV = 'staging';

      expect(getAnalyticsEnvironment()).toBe('staging');

      // Restore
      if (originalValue === undefined) {
        delete process.env.EXPO_PUBLIC_APP_ENV;
      } else {
        process.env.EXPO_PUBLIC_APP_ENV = originalValue;
      }
    });
  });

  describe('sanitizeParams - additional edge cases', () => {
    it('strips access_token field', () => {
      const params = {
        task_id: '123',
        access_token: 'secret-token-123',
      };
      expect(sanitizeParams(params)).toEqual({ task_id: '123' });
    });

    it('strips refresh_token field', () => {
      const params = {
        task_id: '123',
        refresh_token: 'refresh-token-456',
      };
      expect(sanitizeParams(params)).toEqual({ task_id: '123' });
    });

    it('strips sobriety_date field', () => {
      const params = {
        task_id: '123',
        sobriety_date: '2024-01-01',
      };
      expect(sanitizeParams(params)).toEqual({ task_id: '123' });
    });

    it('strips relapse_date field', () => {
      const params = {
        task_id: '123',
        relapse_date: '2024-06-01',
      };
      expect(sanitizeParams(params)).toEqual({ task_id: '123' });
    });

    it('strips multiple PII fields while preserving valid fields', () => {
      const params = {
        event_name: 'task_completed',
        task_id: '123',
        email: 'user@test.com',
        display_name: 'John D.',
        timestamp: Date.now(),
        phone: '555-1234',
        count: 42,
        password: 'secret123',
      };
      expect(sanitizeParams(params)).toEqual({
        event_name: 'task_completed',
        task_id: '123',
        timestamp: params.timestamp,
        count: 42,
      });
    });

    it('handles null values in parameters', () => {
      const params = {
        task_id: '123',
        optional: null,
      };
      expect(sanitizeParams(params)).toEqual({
        task_id: '123',
        optional: null,
      });
    });

    it('handles boolean values', () => {
      const params = {
        is_active: true,
        is_deleted: false,
      };
      expect(sanitizeParams(params)).toEqual({
        is_active: true,
        is_deleted: false,
      });
    });

    it('handles numeric zero', () => {
      const params = {
        count: 0,
        value: 0,
      };
      expect(sanitizeParams(params)).toEqual({
        count: 0,
        value: 0,
      });
    });

    it('handles empty strings in valid fields', () => {
      const params = {
        task_id: '',
        description: '',
      };
      expect(sanitizeParams(params)).toEqual({
        task_id: '',
        description: '',
      });
    });

    it('handles nested objects by preserving them', () => {
      const params = {
        task_id: '123',
        metadata: {
          nested_field: 'value',
        },
      };
      expect(sanitizeParams(params)).toEqual({
        task_id: '123',
        metadata: {
          nested_field: 'value',
        },
      });
    });

    it('strips PII from nested objects', () => {
      const params = {
        task_id: '123',
        email: 'should@be.removed',
        metadata: {
          email: 'also.should@be.removed',
          name: 'Should be removed',
        },
      };
      const result = sanitizeParams(params);
      expect(result.task_id).toBe('123');
      expect(result.email).toBeUndefined();
      expect(result.metadata).toBeDefined();
      expect((result.metadata as Record<string, unknown>)?.email).toBeUndefined();
      expect((result.metadata as Record<string, unknown>)?.name).toBeUndefined();
    });

    it('handles array values', () => {
      const params = {
        task_ids: ['123', '456', '789'],
        tags: ['tag1', 'tag2'],
      };
      expect(sanitizeParams(params)).toEqual({
        task_ids: ['123', '456', '789'],
        tags: ['tag1', 'tag2'],
      });
    });

    it('strips PII from nested arrays of objects', () => {
      const params = {
        task_id: '123',
        users: [
          { id: '1', email: 'user1@test.com', name: 'User One' },
          { id: '2', email: 'user2@test.com', name: 'User Two' },
        ],
      };
      const result = sanitizeParams(params);
      expect(result.task_id).toBe('123');
      expect(Array.isArray(result.users)).toBe(true);
      const users = result.users as Record<string, unknown>[];
      expect(users[0]?.id).toBe('1');
      expect(users[0]?.email).toBeUndefined();
      expect(users[0]?.name).toBeUndefined();
      expect(users[1]?.id).toBe('2');
      expect(users[1]?.email).toBeUndefined();
      expect(users[1]?.name).toBeUndefined();
    });

    it('strips PII from deeply nested objects', () => {
      const params = {
        task_id: '123',
        level1: {
          level2: {
            level3: {
              email: 'deep@nested.com',
              name: 'Deep Nested',
              phone: '555-1234',
            },
          },
        },
      };
      const result = sanitizeParams(params);
      expect(result.task_id).toBe('123');
      const level1 = result.level1 as Record<string, unknown>;
      const level2 = level1?.level2 as Record<string, unknown>;
      const level3 = level2?.level3 as Record<string, unknown>;
      expect(level3?.email).toBeUndefined();
      expect(level3?.name).toBeUndefined();
      expect(level3?.phone).toBeUndefined();
    });

    it('handles circular references gracefully', () => {
      const params: Record<string, unknown> = {
        task_id: '123',
        metadata: {
          email: 'should@be.removed',
        },
      };
      // Create a circular reference
      params.metadata = params;
      const result = sanitizeParams(params);
      expect(result.task_id).toBe('123');
      // Circular reference should be handled (undefined or removed)
      expect(result.metadata).toBeUndefined();
    });

    it('strips PII from arrays containing objects with nested PII', () => {
      const params = {
        events: [
          { type: 'click', metadata: { email: 'user@test.com' } },
          { type: 'view', metadata: { name: 'John Doe' } },
        ],
      };
      const result = sanitizeParams(params);
      const events = result.events as Record<string, unknown>[];
      expect(events[0]?.type).toBe('click');
      expect((events[0]?.metadata as Record<string, unknown>)?.email).toBeUndefined();
      expect(events[1]?.type).toBe('view');
      expect((events[1]?.metadata as Record<string, unknown>)?.name).toBeUndefined();
    });

    it('preserves non-PII fields in nested structures', () => {
      const params = {
        task_id: '123',
        metadata: {
          email: 'should@be.removed',
          name: 'Should be removed',
          description: 'This should remain',
          count: 42,
          is_active: true,
        },
      };
      const result = sanitizeParams(params);
      expect(result.task_id).toBe('123');
      const metadata = result.metadata as Record<string, unknown>;
      expect(metadata?.email).toBeUndefined();
      expect(metadata?.name).toBeUndefined();
      expect(metadata?.description).toBe('This should remain');
      expect(metadata?.count).toBe(42);
      expect(metadata?.is_active).toBe(true);
    });

    it('strips all PII field types from nested objects', () => {
      const params = {
        task_id: '123',
        user_data: {
          email: 'user@test.com',
          name: 'John Doe',
          display_name: 'John D.',
          phone: '555-1234',
          password: 'secret',
          token: 'abc123',
          access_token: 'token123',
          refresh_token: 'refresh123',
          sobriety_date: '2024-01-01',
          relapse_date: '2024-06-01',
          safe_field: 'keep this',
        },
      };
      const result = sanitizeParams(params);
      expect(result.task_id).toBe('123');
      const userData = result.user_data as Record<string, unknown>;
      expect(userData?.email).toBeUndefined();
      expect(userData?.name).toBeUndefined();
      expect(userData?.display_name).toBeUndefined();
      expect(userData?.phone).toBeUndefined();
      expect(userData?.password).toBeUndefined();
      expect(userData?.token).toBeUndefined();
      expect(userData?.access_token).toBeUndefined();
      expect(userData?.refresh_token).toBeUndefined();
      expect(userData?.sobriety_date).toBeUndefined();
      expect(userData?.relapse_date).toBeUndefined();
      expect(userData?.safe_field).toBe('keep this');
    });

    it('handles mixed nested structures with arrays and objects', () => {
      const params = {
        task_id: '123',
        items: [
          {
            id: '1',
            metadata: {
              email: 'user1@test.com',
              tags: ['tag1', 'tag2'],
            },
          },
          {
            id: '2',
            metadata: {
              name: 'User Two',
              nested: {
                phone: '555-1234',
              },
            },
          },
        ],
      };
      const result = sanitizeParams(params);
      expect(result.task_id).toBe('123');
      const items = result.items as Record<string, unknown>[];
      const item1Meta = items[0]?.metadata as Record<string, unknown>;
      expect(item1Meta?.email).toBeUndefined();
      expect(item1Meta?.tags).toEqual(['tag1', 'tag2']);
      const item2Meta = items[1]?.metadata as Record<string, unknown>;
      expect(item2Meta?.name).toBeUndefined();
      const nested = item2Meta?.nested as Record<string, unknown>;
      expect(nested?.phone).toBeUndefined();
    });
  });

  describe('calculateDaysSoberBucket - additional edge cases', () => {
    it('handles fractional days', () => {
      // Implementation uses <= comparison, so 7.9 <= 7 is false, goes to 8-30
      // Similarly, 30.5 <= 30 is false, goes to 31-90
      expect(calculateDaysSoberBucket(7.9)).toBe('8-30');
      expect(calculateDaysSoberBucket(30.5)).toBe('31-90');
    });

    it('handles very large numbers', () => {
      expect(calculateDaysSoberBucket(10000)).toBe('365+');
      expect(calculateDaysSoberBucket(Number.MAX_SAFE_INTEGER)).toBe('365+');
    });

    it('handles zero', () => {
      expect(calculateDaysSoberBucket(0)).toBe('0-7');
    });

    it('handles boundary values for each bucket', () => {
      // Test exact boundaries
      const boundaries = [
        { days: 7, expected: '0-7' },
        { days: 8, expected: '8-30' },
        { days: 30, expected: '8-30' },
        { days: 31, expected: '31-90' },
        { days: 90, expected: '31-90' },
        { days: 91, expected: '91-180' },
        { days: 180, expected: '91-180' },
        { days: 181, expected: '181-365' },
        { days: 365, expected: '181-365' },
        { days: 366, expected: '365+' },
      ];

      boundaries.forEach(({ days, expected }) => {
        expect(calculateDaysSoberBucket(days)).toBe(expected);
      });
    });

    it('handles mid-range values for each bucket', () => {
      expect(calculateDaysSoberBucket(4)).toBe('0-7');
      expect(calculateDaysSoberBucket(15)).toBe('8-30');
      expect(calculateDaysSoberBucket(60)).toBe('31-90');
      expect(calculateDaysSoberBucket(135)).toBe('91-180');
      expect(calculateDaysSoberBucket(273)).toBe('181-365');
      expect(calculateDaysSoberBucket(500)).toBe('365+');
    });

    it('returns valid DaysSoberBucket value', () => {
      const result = calculateDaysSoberBucket(45);
      const validBuckets: DaysSoberBucket[] = ['0-7', '8-30', '31-90', '91-180', '181-365', '365+'];
      expect(validBuckets).toContain(result);
    });
  });

  describe('shouldInitializeAnalytics - additional edge cases', () => {
    afterEach(() => {
      (Platform as { OS: string }).OS = originalPlatformOS;
    });

    it('handles unknown platform values', () => {
      (Platform as { OS: string }).OS = 'unknown' as any;
      // Unknown platforms should behave like native (return true)
      expect(shouldInitializeAnalytics()).toBe(true);
    });

    it('handles Windows platform', () => {
      (Platform as { OS: string }).OS = 'windows' as any;
      // Non-web platforms should return true
      expect(shouldInitializeAnalytics()).toBe(true);
    });

    it('handles macOS platform', () => {
      (Platform as { OS: string }).OS = 'macos' as any;
      // Non-web platforms should return true
      expect(shouldInitializeAnalytics()).toBe(true);
    });

    describe('web platform with various env var states', () => {
      beforeEach(() => {
        (Platform as { OS: string }).OS = 'web';
      });

      it('returns false for whitespace-only measurement ID', () => {
        const originalValue = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = '   ';

        expect(shouldInitializeAnalytics()).toBe(false);

        if (originalValue === undefined) {
          delete process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        } else {
          process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = originalValue;
        }
      });

      it('returns true for valid Firebase measurement ID format', () => {
        const originalValue = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = 'G-ABC123XYZ';

        expect(shouldInitializeAnalytics()).toBe(true);

        if (originalValue === undefined) {
          delete process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
        } else {
          process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = originalValue;
        }
      });
    });
  });

  describe('isDebugMode - additional edge cases', () => {
    it('returns false for EXPO_PUBLIC_ANALYTICS_DEBUG set to "false" string', () => {
      const originalValue = process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = 'false';

      expect(isDebugMode()).toBe(false);

      if (originalValue === undefined) {
        delete process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      } else {
        process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = originalValue;
      }
    });

    it('returns false for EXPO_PUBLIC_ANALYTICS_DEBUG set to "0"', () => {
      const originalValue = process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = '0';

      expect(isDebugMode()).toBe(false);

      if (originalValue === undefined) {
        delete process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      } else {
        process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = originalValue;
      }
    });

    it('returns false for empty string EXPO_PUBLIC_ANALYTICS_DEBUG', () => {
      const originalValue = process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = '';

      expect(isDebugMode()).toBe(false);

      if (originalValue === undefined) {
        delete process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
      } else {
        process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = originalValue;
      }
    });

    it('returns true only for exact string "true"', () => {
      const testCases = [
        { value: 'true', expected: true },
        { value: 'True', expected: false },
        { value: 'TRUE', expected: false },
        { value: '1', expected: false },
        { value: 'yes', expected: false },
      ];

      testCases.forEach(({ value, expected }) => {
        const originalValue = process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
        process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = value;

        expect(isDebugMode()).toBe(expected);

        if (originalValue === undefined) {
          delete process.env.EXPO_PUBLIC_ANALYTICS_DEBUG;
        } else {
          process.env.EXPO_PUBLIC_ANALYTICS_DEBUG = originalValue;
        }
      });
    });
  });

  describe('getAnalyticsEnvironment - additional edge cases', () => {
    it('returns production for empty string EXPO_PUBLIC_APP_ENV', () => {
      const originalValue = process.env.EXPO_PUBLIC_APP_ENV;
      process.env.EXPO_PUBLIC_APP_ENV = '';

      expect(getAnalyticsEnvironment()).toBe('production');

      if (originalValue === undefined) {
        delete process.env.EXPO_PUBLIC_APP_ENV;
      } else {
        process.env.EXPO_PUBLIC_APP_ENV = originalValue;
      }
    });

    it('returns custom environment names', () => {
      const envNames = ['development', 'staging', 'production', 'test', 'preview'];

      envNames.forEach((envName) => {
        const originalValue = process.env.EXPO_PUBLIC_APP_ENV;
        process.env.EXPO_PUBLIC_APP_ENV = envName;

        expect(getAnalyticsEnvironment()).toBe(envName);

        if (originalValue === undefined) {
          delete process.env.EXPO_PUBLIC_APP_ENV;
        } else {
          process.env.EXPO_PUBLIC_APP_ENV = originalValue;
        }
      });
    });

    it('preserves case of environment name', () => {
      const originalValue = process.env.EXPO_PUBLIC_APP_ENV;
      process.env.EXPO_PUBLIC_APP_ENV = 'PRODUCTION';

      expect(getAnalyticsEnvironment()).toBe('PRODUCTION');

      if (originalValue === undefined) {
        delete process.env.EXPO_PUBLIC_APP_ENV;
      } else {
        process.env.EXPO_PUBLIC_APP_ENV = originalValue;
      }
    });
  });
});
