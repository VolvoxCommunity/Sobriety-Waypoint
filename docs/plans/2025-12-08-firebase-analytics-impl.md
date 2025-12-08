# Firebase Analytics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement comprehensive analytics tracking using Firebase Analytics with a unified abstraction layer that works across iOS, Android, and web.

**Architecture:** Platform-agnostic `lib/analytics.ts` module that delegates to `@react-native-firebase/analytics` on native and `firebase/analytics` on web. All app code imports from `@/lib/analytics` - never directly from Firebase SDKs. Events are sanitized for PII before sending.

**Tech Stack:** React Native Firebase (native), Firebase JS SDK (web), Expo config plugin, TypeScript

---

## Prerequisites

Before starting, ensure:

- [ ] Firebase project exists at console.firebase.google.com
- [ ] `GoogleService-Info.plist` downloaded and ready (iOS)
- [ ] `google-services.json` downloaded and ready (Android)
- [ ] Firebase web config values available (apiKey, projectId, appId, measurementId)

---

## Task 1: Create Analytics Types

**Files:**

- Create: `types/analytics.ts`
- Test: `__tests__/types/analytics.test.ts`

**Step 1: Write type validation tests**

```typescript
// __tests__/types/analytics.test.ts
import type {
  EventParams,
  UserProperties,
  AnalyticsConfig,
  DaysSoberBucket,
} from '@/types/analytics';

describe('Analytics Types', () => {
  describe('EventParams', () => {
    it('accepts valid event parameters', () => {
      const params: EventParams = {
        task_id: '123',
        days_to_complete: 3,
        is_first_task: true,
        optional_field: undefined,
      };
      expect(params.task_id).toBe('123');
      expect(params.days_to_complete).toBe(3);
      expect(params.is_first_task).toBe(true);
    });
  });

  describe('UserProperties', () => {
    it('accepts valid user properties', () => {
      const props: UserProperties = {
        days_sober_bucket: '31-90',
        has_sponsor: true,
        has_sponsees: false,
        theme_preference: 'dark',
        sign_in_method: 'google',
      };
      expect(props.days_sober_bucket).toBe('31-90');
      expect(props.sign_in_method).toBe('google');
    });

    it('allows partial user properties', () => {
      const props: UserProperties = {
        theme_preference: 'system',
      };
      expect(props.theme_preference).toBe('system');
      expect(props.has_sponsor).toBeUndefined();
    });
  });

  describe('DaysSoberBucket', () => {
    it('defines all expected bucket ranges', () => {
      const buckets: DaysSoberBucket[] = ['0-7', '8-30', '31-90', '91-180', '181-365', '365+'];
      expect(buckets).toHaveLength(6);
    });
  });

  describe('AnalyticsConfig', () => {
    it('accepts web configuration', () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-api-key',
        projectId: 'test-project',
        appId: 'test-app-id',
        measurementId: 'G-XXXXXXXX',
      };
      expect(config.measurementId).toBe('G-XXXXXXXX');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/types/analytics.test.ts`

Expected: FAIL with "Cannot find module '@/types/analytics'"

**Step 3: Create the types file**

````typescript
// types/analytics.ts
/**
 * Firebase Analytics type definitions for Sobriety Waypoint.
 *
 * These types define the contract for analytics events and user properties
 * tracked across all platforms (iOS, Android, web).
 *
 * @module types/analytics
 */

/**
 * Allowed values for event parameters.
 * Firebase Analytics supports strings, numbers, and booleans.
 */
export type EventParamValue = string | number | boolean | undefined;

/**
 * Generic event parameters object.
 * All custom event parameters must use this interface.
 *
 * @example
 * ```ts
 * const params: EventParams = {
 *   task_id: '123',
 *   days_to_complete: 3,
 *   is_first_task: true,
 * };
 * ```
 */
export interface EventParams {
  [key: string]: EventParamValue;
}

/**
 * Bucketed ranges for days sober.
 * We use buckets instead of exact values to protect user privacy.
 */
export type DaysSoberBucket = '0-7' | '8-30' | '31-90' | '91-180' | '181-365' | '365+';

/**
 * User properties tracked in Firebase Analytics.
 * These are set once and persist across sessions until changed.
 *
 * @remarks
 * All properties are optional - only set properties that have values.
 * Never include PII (email, name, exact dates) in user properties.
 */
export interface UserProperties {
  /** Bucketed sobriety duration for cohort analysis */
  days_sober_bucket?: DaysSoberBucket;
  /** Whether user has an active sponsor relationship */
  has_sponsor?: boolean;
  /** Whether user is sponsoring others */
  has_sponsees?: boolean;
  /** User's theme preference */
  theme_preference?: 'light' | 'dark' | 'system';
  /** Authentication method used */
  sign_in_method?: 'email' | 'google' | 'apple';
}

/**
 * Firebase web SDK configuration.
 * These values come from Firebase Console > Project Settings > Web App.
 */
export interface AnalyticsConfig {
  apiKey: string;
  projectId: string;
  appId: string;
  measurementId: string;
}

/**
 * Analytics event names used throughout the app.
 * Using a const object ensures consistency and enables autocomplete.
 */
export const AnalyticsEvents = {
  // Authentication
  AUTH_SIGN_UP: 'auth_sign_up',
  AUTH_LOGIN: 'auth_login',
  AUTH_LOGOUT: 'auth_logout',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_SOBRIETY_DATE_SET: 'onboarding_sobriety_date_set',
  ONBOARDING_COMPLETED: 'onboarding_completed',

  // Core Features
  SCREEN_VIEW: 'screen_view',
  TASK_VIEWED: 'task_viewed',
  TASK_STARTED: 'task_started',
  TASK_COMPLETED: 'task_completed',
  STEP_VIEWED: 'step_viewed',

  // Milestones
  MILESTONE_REACHED: 'milestone_reached',
  MILESTONE_SHARED: 'milestone_shared',

  // Social
  SPONSOR_CONNECTED: 'sponsor_connected',
  SPONSOR_INVITE_SENT: 'sponsor_invite_sent',
  SPONSOR_INVITE_ACCEPTED: 'sponsor_invite_accepted',
  MESSAGE_SENT: 'message_sent',

  // Retention
  APP_OPENED: 'app_opened',
  DAILY_CHECK_IN: 'daily_check_in',
} as const;

/**
 * Type for valid analytics event names.
 */
export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
````

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/types/analytics.test.ts`

Expected: PASS

**Step 5: Run full validation**

Run: `pnpm format && pnpm lint && pnpm typecheck`

Expected: All pass

**Step 6: Commit**

```bash
git add types/analytics.ts __tests__/types/analytics.test.ts
git commit -m "feat(analytics): add TypeScript types for Firebase Analytics"
```

---

## Task 2: Create Analytics Utility Functions

**Files:**

- Create: `lib/analytics-utils.ts`
- Test: `__tests__/lib/analytics-utils.test.ts`

**Step 1: Write tests for utility functions**

```typescript
// __tests__/lib/analytics-utils.test.ts
import {
  sanitizeParams,
  calculateDaysSoberBucket,
  shouldInitializeAnalytics,
} from '@/lib/analytics-utils';
import type { DaysSoberBucket } from '@/types/analytics';

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
        first_name: 'John',
        last_name: 'Doe',
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

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('returns true when Firebase config is set', () => {
      process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = 'G-XXXXXXXX';
      expect(shouldInitializeAnalytics()).toBe(true);
    });

    it('returns false when Firebase config is missing', () => {
      delete process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
      expect(shouldInitializeAnalytics()).toBe(false);
    });

    it('returns false when Firebase config is empty string', () => {
      process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = '';
      expect(shouldInitializeAnalytics()).toBe(false);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/lib/analytics-utils.test.ts`

Expected: FAIL with "Cannot find module '@/lib/analytics-utils'"

**Step 3: Create the utility functions**

````typescript
// lib/analytics-utils.ts
/**
 * Utility functions for Firebase Analytics.
 *
 * These helpers handle PII sanitization, bucket calculations,
 * and initialization checks.
 *
 * @module lib/analytics-utils
 */

import type { EventParams, DaysSoberBucket } from '@/types/analytics';

/**
 * PII fields that must be stripped from analytics events.
 * These fields could identify users and must never be sent to Firebase.
 */
const PII_FIELDS = [
  'email',
  'name',
  'first_name',
  'last_name',
  'phone',
  'password',
  'token',
  'access_token',
  'refresh_token',
  'sobriety_date',
  'relapse_date',
] as const;

/**
 * Removes PII fields from event parameters before sending to Firebase.
 *
 * @param params - The event parameters to sanitize
 * @returns Sanitized parameters with PII fields removed
 *
 * @example
 * ```ts
 * const safe = sanitizeParams({ task_id: '123', email: 'user@test.com' });
 * // Returns: { task_id: '123' }
 * ```
 */
export function sanitizeParams(params: EventParams | undefined): EventParams {
  if (!params) return {};

  const sanitized = { ...params };

  for (const field of PII_FIELDS) {
    delete sanitized[field];
  }

  return sanitized;
}

/**
 * Calculates the appropriate bucket for days sober.
 *
 * We use buckets instead of exact values to protect user privacy
 * while still enabling cohort analysis in Firebase.
 *
 * @param days - The number of days sober
 * @returns The bucket range the days fall into
 *
 * @example
 * ```ts
 * calculateDaysSoberBucket(45); // Returns: '31-90'
 * calculateDaysSoberBucket(400); // Returns: '365+'
 * ```
 */
export function calculateDaysSoberBucket(days: number): DaysSoberBucket {
  if (days <= 7) return '0-7';
  if (days <= 30) return '8-30';
  if (days <= 90) return '31-90';
  if (days <= 180) return '91-180';
  if (days <= 365) return '181-365';
  return '365+';
}

/**
 * Checks if Firebase Analytics should be initialized.
 *
 * Analytics is only initialized when the Firebase measurement ID
 * environment variable is configured.
 *
 * @returns True if analytics should be initialized
 */
export function shouldInitializeAnalytics(): boolean {
  const measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
  return Boolean(measurementId && measurementId.length > 0);
}

/**
 * Checks if the app is running in debug mode.
 *
 * In debug mode, analytics events are logged to console
 * and GA4 DebugView is enabled.
 *
 * @returns True if in debug mode
 */
export function isDebugMode(): boolean {
  // @ts-expect-error __DEV__ is a React Native global
  return __DEV__ || process.env.EXPO_PUBLIC_ANALYTICS_DEBUG === 'true';
}

/**
 * Gets the current environment for analytics tagging.
 *
 * @returns The environment name
 */
export function getAnalyticsEnvironment(): string {
  // @ts-expect-error __DEV__ is a React Native global
  if (__DEV__) return 'development';
  return process.env.EXPO_PUBLIC_APP_ENV || 'production';
}
````

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/lib/analytics-utils.test.ts`

Expected: PASS

**Step 5: Run full validation**

Run: `pnpm format && pnpm lint && pnpm typecheck`

Expected: All pass

**Step 6: Commit**

```bash
git add lib/analytics-utils.ts __tests__/lib/analytics-utils.test.ts
git commit -m "feat(analytics): add utility functions for PII sanitization and bucketing"
```

---

## Task 3: Install Firebase Dependencies

**Files:**

- Modify: `package.json`
- Create: `ios/GoogleService-Info.plist` (copy from Firebase Console)
- Create: `android/app/google-services.json` (copy from Firebase Console)
- Modify: `app.config.ts`

**Step 1: Install React Native Firebase packages**

Run:

```bash
pnpm add @react-native-firebase/app @react-native-firebase/analytics firebase
```

Expected: Packages added to package.json

**Step 2: Copy Firebase config files**

Copy `GoogleService-Info.plist` to `ios/` directory.
Copy `google-services.json` to `android/app/` directory.

Note: These files are downloaded from Firebase Console. They contain public client configuration (not secrets).

**Step 3: Update app.config.ts with Firebase plugin**

Read the current app.config.ts first, then add the Firebase plugin to the plugins array:

```typescript
// In app.config.ts, add to the plugins array:
[
  '@react-native-firebase/app',
  {
    // iOS uses GoogleService-Info.plist automatically from ios/ directory
    // Android uses google-services.json automatically from android/app/ directory
  },
],
```

**Step 4: Add Firebase environment variables to .env.example**

```env
# Firebase Analytics (Web)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Optional: Enable debug mode for analytics
EXPO_PUBLIC_ANALYTICS_DEBUG=false
```

**Step 5: Run typecheck to verify configuration**

Run: `pnpm typecheck`

Expected: PASS

**Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml app.config.ts .env.example
git add ios/GoogleService-Info.plist android/app/google-services.json
git commit -m "chore(deps): add Firebase Analytics dependencies and configuration"
```

---

## Task 4: Create Web Analytics Implementation

**Files:**

- Create: `lib/analytics.web.ts`
- Test: `__tests__/lib/analytics.web.test.ts`

**Step 1: Write tests for web analytics**

```typescript
// __tests__/lib/analytics.web.test.ts
/**
 * @jest-environment jsdom
 */

// Mock firebase/app and firebase/analytics before imports
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: 'test-app' })),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({ app: { name: 'test-app' } })),
  logEvent: jest.fn(),
  setUserId: jest.fn(),
  setUserProperties: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(true)),
}));

import { initializeApp, getApps } from 'firebase/app';
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
  isSupported,
} from 'firebase/analytics';

// Import after mocks are set up
import {
  initializeWebAnalytics,
  trackEventWeb,
  setUserIdWeb,
  setUserPropertiesWeb,
  resetAnalyticsWeb,
} from '@/lib/analytics.web';

describe('Web Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getApps as jest.Mock).mockReturnValue([]);
  });

  describe('initializeWebAnalytics', () => {
    const mockConfig = {
      apiKey: 'test-key',
      projectId: 'test-project',
      appId: 'test-app-id',
      measurementId: 'G-XXXXXXXX',
    };

    it('initializes Firebase app with config', async () => {
      await initializeWebAnalytics(mockConfig);

      expect(initializeApp).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'test-key',
          projectId: 'test-project',
          appId: 'test-app-id',
          measurementId: 'G-XXXXXXXX',
        })
      );
    });

    it('initializes analytics after app', async () => {
      await initializeWebAnalytics(mockConfig);

      expect(getAnalytics).toHaveBeenCalled();
    });

    it('does not reinitialize if app already exists', async () => {
      (getApps as jest.Mock).mockReturnValue([{ name: 'existing' }]);

      await initializeWebAnalytics(mockConfig);

      expect(initializeApp).not.toHaveBeenCalled();
    });

    it('handles unsupported browsers gracefully', async () => {
      (isSupported as jest.Mock).mockResolvedValue(false);

      await expect(initializeWebAnalytics(mockConfig)).resolves.not.toThrow();
    });
  });

  describe('trackEventWeb', () => {
    it('calls logEvent with event name and params', () => {
      trackEventWeb('test_event', { param1: 'value1' });

      expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'test_event', { param1: 'value1' });
    });

    it('calls logEvent without params when none provided', () => {
      trackEventWeb('test_event');

      expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'test_event', undefined);
    });
  });

  describe('setUserIdWeb', () => {
    it('sets user ID', () => {
      setUserIdWeb('user-123');

      expect(setUserId).toHaveBeenCalledWith(expect.anything(), 'user-123');
    });

    it('clears user ID when null', () => {
      setUserIdWeb(null);

      expect(setUserId).toHaveBeenCalledWith(expect.anything(), null);
    });
  });

  describe('setUserPropertiesWeb', () => {
    it('sets user properties', () => {
      const props = { theme_preference: 'dark' as const };
      setUserPropertiesWeb(props);

      expect(setUserProperties).toHaveBeenCalledWith(expect.anything(), props);
    });
  });

  describe('resetAnalyticsWeb', () => {
    it('clears user ID', async () => {
      await resetAnalyticsWeb();

      expect(setUserId).toHaveBeenCalledWith(expect.anything(), null);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/lib/analytics.web.test.ts`

Expected: FAIL with "Cannot find module '@/lib/analytics.web'"

**Step 3: Create web analytics implementation**

```typescript
// lib/analytics.web.ts
/**
 * Firebase Analytics implementation for web platform.
 *
 * This module uses the Firebase JS SDK to track analytics events
 * in web browsers. It should only be imported on web platform.
 *
 * @module lib/analytics.web
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  logEvent,
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties,
  isSupported,
  Analytics,
} from 'firebase/analytics';

import type { EventParams, UserProperties, AnalyticsConfig } from '@/types/analytics';
import { isDebugMode } from '@/lib/analytics-utils';

let analytics: Analytics | null = null;
let app: FirebaseApp | null = null;

/**
 * Initializes Firebase Analytics for web.
 *
 * @param config - Firebase configuration from environment variables
 */
export async function initializeWebAnalytics(config: AnalyticsConfig): Promise<void> {
  try {
    // Check if analytics is supported in this browser
    const supported = await isSupported();
    if (!supported) {
      if (isDebugMode()) {
        console.warn('[Analytics] Firebase Analytics not supported in this browser');
      }
      return;
    }

    // Don't reinitialize if already set up
    if (getApps().length > 0) {
      if (isDebugMode()) {
        console.log('[Analytics] Firebase app already initialized');
      }
      return;
    }

    // Initialize Firebase app
    app = initializeApp({
      apiKey: config.apiKey,
      projectId: config.projectId,
      appId: config.appId,
      measurementId: config.measurementId,
    });

    // Initialize Analytics
    analytics = getAnalytics(app);

    if (isDebugMode()) {
      console.log('[Analytics] Firebase Analytics initialized for web');
    }
  } catch (error) {
    console.error('[Analytics] Failed to initialize:', error);
  }
}

/**
 * Tracks an analytics event on web.
 *
 * @param eventName - The name of the event
 * @param params - Optional event parameters
 */
export function trackEventWeb(eventName: string, params?: EventParams): void {
  if (!analytics) {
    if (isDebugMode()) {
      console.log(`[Analytics] Event (not sent - not initialized): ${eventName}`, params);
    }
    return;
  }

  if (isDebugMode()) {
    console.log(`[Analytics] Event: ${eventName}`, params);
  }

  logEvent(analytics, eventName, params);
}

/**
 * Sets the user ID for analytics.
 *
 * @param userId - The user ID or null to clear
 */
export function setUserIdWeb(userId: string | null): void {
  if (!analytics) {
    if (isDebugMode()) {
      console.log(`[Analytics] setUserId (not sent - not initialized): ${userId}`);
    }
    return;
  }

  if (isDebugMode()) {
    console.log(`[Analytics] setUserId: ${userId}`);
  }

  firebaseSetUserId(analytics, userId);
}

/**
 * Sets user properties for analytics.
 *
 * @param properties - The user properties to set
 */
export function setUserPropertiesWeb(properties: UserProperties): void {
  if (!analytics) {
    if (isDebugMode()) {
      console.log('[Analytics] setUserProperties (not sent - not initialized):', properties);
    }
    return;
  }

  if (isDebugMode()) {
    console.log('[Analytics] setUserProperties:', properties);
  }

  firebaseSetUserProperties(analytics, properties);
}

/**
 * Tracks a screen view event on web.
 *
 * @param screenName - The name of the screen
 * @param screenClass - Optional screen class name
 */
export function trackScreenViewWeb(screenName: string, screenClass?: string): void {
  trackEventWeb('screen_view', {
    screen_name: screenName,
    screen_class: screenClass || screenName,
  });
}

/**
 * Resets analytics for logout.
 * Clears user ID and any user-specific data.
 */
export async function resetAnalyticsWeb(): Promise<void> {
  if (isDebugMode()) {
    console.log('[Analytics] Resetting analytics state');
  }

  setUserIdWeb(null);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/lib/analytics.web.test.ts`

Expected: PASS

**Step 5: Run full validation**

Run: `pnpm format && pnpm lint && pnpm typecheck`

Expected: All pass

**Step 6: Commit**

```bash
git add lib/analytics.web.ts __tests__/lib/analytics.web.test.ts
git commit -m "feat(analytics): add web platform Firebase Analytics implementation"
```

---

## Task 5: Create Native Analytics Implementation

**Files:**

- Create: `lib/analytics.native.ts`
- Test: `__tests__/lib/analytics.native.test.ts`

**Step 1: Write tests for native analytics**

```typescript
// __tests__/lib/analytics.native.test.ts

// Mock @react-native-firebase/analytics before imports
jest.mock('@react-native-firebase/analytics', () => {
  const mockAnalytics = {
    logEvent: jest.fn(() => Promise.resolve()),
    setUserId: jest.fn(() => Promise.resolve()),
    setUserProperties: jest.fn(() => Promise.resolve()),
    logScreenView: jest.fn(() => Promise.resolve()),
    resetAnalyticsData: jest.fn(() => Promise.resolve()),
  };
  return {
    __esModule: true,
    default: jest.fn(() => mockAnalytics),
  };
});

import analytics from '@react-native-firebase/analytics';
import {
  initializeNativeAnalytics,
  trackEventNative,
  setUserIdNative,
  setUserPropertiesNative,
  trackScreenViewNative,
  resetAnalyticsNative,
} from '@/lib/analytics.native';

describe('Native Analytics', () => {
  const mockAnalyticsInstance = analytics();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeNativeAnalytics', () => {
    it('completes without error', async () => {
      await expect(initializeNativeAnalytics()).resolves.not.toThrow();
    });
  });

  describe('trackEventNative', () => {
    it('calls logEvent with event name and params', async () => {
      await trackEventNative('test_event', { param1: 'value1' });

      expect(mockAnalyticsInstance.logEvent).toHaveBeenCalledWith('test_event', {
        param1: 'value1',
      });
    });

    it('calls logEvent without params when none provided', async () => {
      await trackEventNative('test_event');

      expect(mockAnalyticsInstance.logEvent).toHaveBeenCalledWith('test_event', undefined);
    });
  });

  describe('setUserIdNative', () => {
    it('sets user ID', async () => {
      await setUserIdNative('user-123');

      expect(mockAnalyticsInstance.setUserId).toHaveBeenCalledWith('user-123');
    });

    it('clears user ID when null', async () => {
      await setUserIdNative(null);

      expect(mockAnalyticsInstance.setUserId).toHaveBeenCalledWith(null);
    });
  });

  describe('setUserPropertiesNative', () => {
    it('sets user properties', async () => {
      const props = { theme_preference: 'dark' };
      await setUserPropertiesNative(props);

      expect(mockAnalyticsInstance.setUserProperties).toHaveBeenCalledWith(props);
    });
  });

  describe('trackScreenViewNative', () => {
    it('logs screen view with name', async () => {
      await trackScreenViewNative('HomeScreen');

      expect(mockAnalyticsInstance.logScreenView).toHaveBeenCalledWith({
        screen_name: 'HomeScreen',
        screen_class: 'HomeScreen',
      });
    });

    it('logs screen view with name and class', async () => {
      await trackScreenViewNative('HomeScreen', 'TabScreen');

      expect(mockAnalyticsInstance.logScreenView).toHaveBeenCalledWith({
        screen_name: 'HomeScreen',
        screen_class: 'TabScreen',
      });
    });
  });

  describe('resetAnalyticsNative', () => {
    it('resets analytics data', async () => {
      await resetAnalyticsNative();

      expect(mockAnalyticsInstance.resetAnalyticsData).toHaveBeenCalled();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/lib/analytics.native.test.ts`

Expected: FAIL with "Cannot find module '@/lib/analytics.native'"

**Step 3: Create native analytics implementation**

```typescript
// lib/analytics.native.ts
/**
 * Firebase Analytics implementation for native platforms (iOS/Android).
 *
 * This module uses React Native Firebase to track analytics events
 * on native mobile platforms. It should only be imported on iOS/Android.
 *
 * @module lib/analytics.native
 */

import analytics from '@react-native-firebase/analytics';

import type { EventParams, UserProperties } from '@/types/analytics';
import { isDebugMode } from '@/lib/analytics-utils';

/**
 * Initializes Firebase Analytics for native platforms.
 *
 * On native, Firebase is configured via GoogleService-Info.plist (iOS)
 * and google-services.json (Android), so minimal setup is needed here.
 */
export async function initializeNativeAnalytics(): Promise<void> {
  try {
    // Enable debug mode if needed
    if (isDebugMode()) {
      await analytics().setAnalyticsCollectionEnabled(true);
      console.log('[Analytics] Firebase Analytics initialized for native');
    }
  } catch (error) {
    console.error('[Analytics] Failed to initialize native analytics:', error);
  }
}

/**
 * Tracks an analytics event on native.
 *
 * @param eventName - The name of the event
 * @param params - Optional event parameters
 */
export async function trackEventNative(eventName: string, params?: EventParams): Promise<void> {
  try {
    if (isDebugMode()) {
      console.log(`[Analytics] Event: ${eventName}`, params);
    }

    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error(`[Analytics] Failed to track event ${eventName}:`, error);
  }
}

/**
 * Sets the user ID for analytics.
 *
 * @param userId - The user ID or null to clear
 */
export async function setUserIdNative(userId: string | null): Promise<void> {
  try {
    if (isDebugMode()) {
      console.log(`[Analytics] setUserId: ${userId}`);
    }

    await analytics().setUserId(userId);
  } catch (error) {
    console.error('[Analytics] Failed to set user ID:', error);
  }
}

/**
 * Sets user properties for analytics.
 *
 * @param properties - The user properties to set
 */
export async function setUserPropertiesNative(properties: UserProperties): Promise<void> {
  try {
    if (isDebugMode()) {
      console.log('[Analytics] setUserProperties:', properties);
    }

    await analytics().setUserProperties(properties);
  } catch (error) {
    console.error('[Analytics] Failed to set user properties:', error);
  }
}

/**
 * Tracks a screen view event on native.
 *
 * @param screenName - The name of the screen
 * @param screenClass - Optional screen class name
 */
export async function trackScreenViewNative(
  screenName: string,
  screenClass?: string
): Promise<void> {
  try {
    if (isDebugMode()) {
      console.log(`[Analytics] Screen view: ${screenName}`);
    }

    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.error('[Analytics] Failed to track screen view:', error);
  }
}

/**
 * Resets analytics for logout.
 * Clears user ID and any user-specific data.
 */
export async function resetAnalyticsNative(): Promise<void> {
  try {
    if (isDebugMode()) {
      console.log('[Analytics] Resetting analytics state');
    }

    await analytics().resetAnalyticsData();
  } catch (error) {
    console.error('[Analytics] Failed to reset analytics:', error);
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/lib/analytics.native.test.ts`

Expected: PASS

**Step 5: Run full validation**

Run: `pnpm format && pnpm lint && pnpm typecheck`

Expected: All pass

**Step 6: Commit**

```bash
git add lib/analytics.native.ts __tests__/lib/analytics.native.test.ts
git commit -m "feat(analytics): add native platform Firebase Analytics implementation"
```

---

## Task 6: Create Unified Analytics Module

**Files:**

- Create: `lib/analytics.ts`
- Test: `__tests__/lib/analytics.test.ts`

**Step 1: Write tests for unified analytics module**

```typescript
// __tests__/lib/analytics.test.ts
import { Platform } from 'react-native';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: jest.fn(
      (options: { web?: unknown; default?: unknown }) => options.web ?? options.default
    ),
  },
}));

// Mock the platform-specific modules
jest.mock('@/lib/analytics.web', () => ({
  initializeWebAnalytics: jest.fn(() => Promise.resolve()),
  trackEventWeb: jest.fn(),
  setUserIdWeb: jest.fn(),
  setUserPropertiesWeb: jest.fn(),
  trackScreenViewWeb: jest.fn(),
  resetAnalyticsWeb: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/lib/analytics.native', () => ({
  initializeNativeAnalytics: jest.fn(() => Promise.resolve()),
  trackEventNative: jest.fn(() => Promise.resolve()),
  setUserIdNative: jest.fn(() => Promise.resolve()),
  setUserPropertiesNative: jest.fn(() => Promise.resolve()),
  trackScreenViewNative: jest.fn(() => Promise.resolve()),
  resetAnalyticsNative: jest.fn(() => Promise.resolve()),
}));

// Mock analytics-utils
jest.mock('@/lib/analytics-utils', () => ({
  sanitizeParams: jest.fn((params) => params),
  shouldInitializeAnalytics: jest.fn(() => true),
  isDebugMode: jest.fn(() => false),
}));

import {
  initializeAnalytics,
  trackEvent,
  setUserId,
  setUserProperties,
  trackScreenView,
  resetAnalytics,
} from '@/lib/analytics';
import { trackEventWeb, setUserIdWeb, setUserPropertiesWeb } from '@/lib/analytics.web';
import { sanitizeParams, shouldInitializeAnalytics } from '@/lib/analytics-utils';

describe('Unified Analytics Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (shouldInitializeAnalytics as jest.Mock).mockReturnValue(true);
  });

  describe('initializeAnalytics', () => {
    it('does not initialize when config is missing', async () => {
      (shouldInitializeAnalytics as jest.Mock).mockReturnValue(false);

      await initializeAnalytics();

      // Should return early without calling platform init
      expect(trackEventWeb).not.toHaveBeenCalled();
    });
  });

  describe('trackEvent', () => {
    it('sanitizes params before tracking', () => {
      const params = { task_id: '123', email: 'test@test.com' };
      trackEvent('test_event', params);

      expect(sanitizeParams).toHaveBeenCalledWith(params);
    });

    it('tracks event on web platform', () => {
      trackEvent('test_event', { task_id: '123' });

      expect(trackEventWeb).toHaveBeenCalledWith('test_event', { task_id: '123' });
    });
  });

  describe('setUserId', () => {
    it('sets user ID on web platform', () => {
      setUserId('user-123');

      expect(setUserIdWeb).toHaveBeenCalledWith('user-123');
    });

    it('clears user ID when null', () => {
      setUserId(null);

      expect(setUserIdWeb).toHaveBeenCalledWith(null);
    });
  });

  describe('setUserProperties', () => {
    it('sets user properties on web platform', () => {
      const props = { theme_preference: 'dark' as const };
      setUserProperties(props);

      expect(setUserPropertiesWeb).toHaveBeenCalledWith(props);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/lib/analytics.test.ts`

Expected: FAIL with "Cannot find module '@/lib/analytics'"

**Step 3: Create unified analytics module**

````typescript
// lib/analytics.ts
/**
 * Unified Firebase Analytics module for Sobriety Waypoint.
 *
 * This is the ONLY module that app code should import for analytics.
 * It provides a platform-agnostic API that delegates to the appropriate
 * implementation (web or native) based on the current platform.
 *
 * @module lib/analytics
 *
 * @example
 * ```ts
 * import { trackEvent, setUserId, setUserProperties } from '@/lib/analytics';
 *
 * // Track an event
 * trackEvent('task_completed', { task_id: '123' });
 *
 * // Set user ID after login
 * setUserId(user.id);
 *
 * // Set user properties
 * setUserProperties({ days_sober_bucket: '31-90' });
 * ```
 */

import { Platform } from 'react-native';

import type { EventParams, UserProperties, AnalyticsConfig } from '@/types/analytics';
import { sanitizeParams, shouldInitializeAnalytics, isDebugMode } from '@/lib/analytics-utils';

// Platform-specific imports
import {
  initializeWebAnalytics,
  trackEventWeb,
  setUserIdWeb,
  setUserPropertiesWeb,
  trackScreenViewWeb,
  resetAnalyticsWeb,
} from '@/lib/analytics.web';

import {
  initializeNativeAnalytics,
  trackEventNative,
  setUserIdNative,
  setUserPropertiesNative,
  trackScreenViewNative,
  resetAnalyticsNative,
} from '@/lib/analytics.native';

// Re-export types and constants for convenience
export { AnalyticsEvents, type AnalyticsEventName } from '@/types/analytics';
export { calculateDaysSoberBucket } from '@/lib/analytics-utils';

const isWeb = Platform.OS === 'web';

/**
 * Initializes Firebase Analytics.
 *
 * Call this once at app startup, before any other analytics calls.
 * On native platforms, Firebase is configured via config files.
 * On web, it uses environment variables.
 *
 * @example
 * ```ts
 * // In app/_layout.tsx, at the top before React imports
 * import { initializeAnalytics } from '@/lib/analytics';
 * initializeAnalytics();
 * ```
 */
export async function initializeAnalytics(): Promise<void> {
  if (!shouldInitializeAnalytics()) {
    if (isDebugMode()) {
      console.warn('[Analytics] Firebase not configured - analytics disabled');
    }
    return;
  }

  if (isWeb) {
    const config: AnalyticsConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
    };
    await initializeWebAnalytics(config);
  } else {
    await initializeNativeAnalytics();
  }
}

/**
 * Tracks an analytics event.
 *
 * Event parameters are automatically sanitized to remove PII fields.
 *
 * @param eventName - The name of the event (use AnalyticsEvents constants)
 * @param params - Optional event parameters
 *
 * @example
 * ```ts
 * import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
 *
 * trackEvent(AnalyticsEvents.TASK_COMPLETED, {
 *   task_id: '123',
 *   days_to_complete: 3,
 * });
 * ```
 */
export function trackEvent(eventName: string, params?: EventParams): void {
  const sanitized = sanitizeParams(params);

  if (isWeb) {
    trackEventWeb(eventName, sanitized);
  } else {
    // Fire and forget for native - don't await
    trackEventNative(eventName, sanitized);
  }
}

/**
 * Sets the user ID for analytics.
 *
 * Call this when a user signs in. The user ID should be the
 * Supabase user ID (UUID), which is pseudonymous.
 *
 * @param userId - The user ID or null to clear
 *
 * @example
 * ```ts
 * // After sign in
 * setUserId(user.id);
 *
 * // After sign out
 * setUserId(null);
 * ```
 */
export function setUserId(userId: string | null): void {
  if (isWeb) {
    setUserIdWeb(userId);
  } else {
    setUserIdNative(userId);
  }
}

/**
 * Sets user properties for analytics.
 *
 * User properties persist across sessions and are attached to all events.
 * Only set properties that have values - undefined properties are ignored.
 *
 * @param properties - The user properties to set
 *
 * @example
 * ```ts
 * setUserProperties({
 *   days_sober_bucket: '31-90',
 *   has_sponsor: true,
 *   theme_preference: 'dark',
 * });
 * ```
 */
export function setUserProperties(properties: UserProperties): void {
  if (isWeb) {
    setUserPropertiesWeb(properties);
  } else {
    setUserPropertiesNative(properties);
  }
}

/**
 * Tracks a screen view event.
 *
 * This is typically called automatically by navigation tracking,
 * but can be called manually for non-standard screens.
 *
 * @param screenName - The name of the screen
 * @param screenClass - Optional screen class name
 *
 * @example
 * ```ts
 * trackScreenView('HomeScreen', 'TabScreen');
 * ```
 */
export function trackScreenView(screenName: string, screenClass?: string): void {
  if (isWeb) {
    trackScreenViewWeb(screenName, screenClass);
  } else {
    trackScreenViewNative(screenName, screenClass);
  }
}

/**
 * Resets analytics for logout.
 *
 * Clears the user ID and any user-specific analytics data.
 * Call this when a user signs out.
 *
 * @example
 * ```ts
 * // In sign out handler
 * await resetAnalytics();
 * ```
 */
export async function resetAnalytics(): Promise<void> {
  if (isWeb) {
    await resetAnalyticsWeb();
  } else {
    await resetAnalyticsNative();
  }
}
````

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/lib/analytics.test.ts`

Expected: PASS

**Step 5: Run full validation**

Run: `pnpm format && pnpm lint && pnpm typecheck`

Expected: All pass

**Step 6: Commit**

```bash
git add lib/analytics.ts __tests__/lib/analytics.test.ts
git commit -m "feat(analytics): add unified platform-agnostic analytics module"
```

---

## Task 7: Integrate Analytics Initialization in Root Layout

**Files:**

- Modify: `app/_layout.tsx`
- Test: Manual verification (initialization happens at module load)

**Step 1: Read current \_layout.tsx**

Read the file to understand current structure.

**Step 2: Add analytics initialization at top of file**

Add immediately after Sentry initialization, before React imports:

```typescript
// At the top of app/_layout.tsx, after Sentry init
import { initializeSentry, navigationIntegration, wrapRootComponent } from '@/lib/sentry';
initializeSentry();

import { initializeAnalytics } from '@/lib/analytics';
initializeAnalytics();

/* eslint-disable import/first -- Sentry and Analytics must initialize before React components load */
```

**Step 3: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS

**Step 4: Run full validation**

Run: `pnpm format && pnpm lint && pnpm typecheck && pnpm build:web`

Expected: All pass

**Step 5: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(analytics): initialize Firebase Analytics in root layout"
```

---

## Task 8: Add Auth Event Tracking

**Files:**

- Modify: `contexts/AuthContext.tsx`
- Test: `__tests__/contexts/AuthContext.test.tsx` (update existing tests)

**Step 1: Read current AuthContext.tsx**

Read the file to understand current structure.

**Step 2: Add analytics imports**

```typescript
import {
  trackEvent,
  setUserId,
  setUserProperties,
  resetAnalytics,
  calculateDaysSoberBucket,
  AnalyticsEvents,
} from '@/lib/analytics';
```

**Step 3: Add analytics tracking to signIn**

In the `signIn` function, after successful authentication:

```typescript
// After successful sign in
trackEvent(AnalyticsEvents.AUTH_LOGIN, { method: 'email' });
```

**Step 4: Add analytics tracking to signInWithGoogle**

In the `signInWithGoogle` function, after successful authentication:

```typescript
// After successful sign in
trackEvent(AnalyticsEvents.AUTH_LOGIN, { method: 'google' });
```

**Step 5: Add analytics tracking to signUp**

In the `signUp` function, after successful registration:

```typescript
// After successful sign up
trackEvent(AnalyticsEvents.AUTH_SIGN_UP, { method: 'email' });
```

**Step 6: Add analytics tracking to signOut**

In the `signOut` function, before signing out:

```typescript
// Before signing out
trackEvent(AnalyticsEvents.AUTH_LOGOUT);
await resetAnalytics();
```

**Step 7: Add user ID and properties on profile load**

In the useEffect that watches profile changes:

```typescript
useEffect(() => {
  if (profile) {
    // Existing Sentry calls...
    setSentryUser(profile.id);
    setSentryContext('profile', { email: profile.email });

    // Add analytics user tracking
    setUserId(profile.id);

    // Calculate days sober bucket if sobriety_date exists
    if (profile.sobriety_date) {
      const sobrietyDate = new Date(profile.sobriety_date);
      const today = new Date();
      const daysSober = Math.floor(
        (today.getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      setUserProperties({
        days_sober_bucket: calculateDaysSoberBucket(daysSober),
      });
    }
  } else {
    clearSentryUser();
    setUserId(null);
  }
}, [profile]);
```

**Step 8: Update tests to mock analytics**

Add analytics mocks to the AuthContext test file:

```typescript
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
  setUserId: jest.fn(),
  setUserProperties: jest.fn(),
  resetAnalytics: jest.fn(() => Promise.resolve()),
  calculateDaysSoberBucket: jest.fn(() => '31-90'),
  AnalyticsEvents: {
    AUTH_LOGIN: 'auth_login',
    AUTH_SIGN_UP: 'auth_sign_up',
    AUTH_LOGOUT: 'auth_logout',
  },
}));
```

**Step 9: Run tests**

Run: `pnpm test -- __tests__/contexts/AuthContext.test.tsx`

Expected: PASS

**Step 10: Run full validation**

Run: `pnpm format && pnpm lint && pnpm typecheck`

Expected: All pass

**Step 11: Commit**

```bash
git add contexts/AuthContext.tsx __tests__/contexts/AuthContext.test.tsx
git commit -m "feat(analytics): add auth event tracking in AuthContext"
```

---

## Task 9: Add Onboarding Event Tracking

**Files:**

- Modify: `app/onboarding.tsx`
- Test: `__tests__/app/onboarding.test.tsx` (update existing tests)

**Step 1: Read current onboarding.tsx**

Read the file to understand current structure.

**Step 2: Add analytics imports**

```typescript
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
```

**Step 3: Track onboarding started on mount**

Add a useEffect to track when user lands on onboarding:

```typescript
// Add state to track start time
const [onboardingStartTime] = useState(() => Date.now());

// Track onboarding started
useEffect(() => {
  trackEvent(AnalyticsEvents.ONBOARDING_STARTED);
}, []);
```

**Step 4: Track step completion**

When user moves from step 1 to step 2:

```typescript
// In the handler that moves to step 2
trackEvent(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, {
  step: 1,
  step_name: 'name_entry',
});
```

**Step 5: Track sobriety date set**

When user sets their sobriety date:

```typescript
// Calculate days sober
const today = new Date();
const daysSober = Math.floor((today.getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24));

trackEvent(AnalyticsEvents.ONBOARDING_SOBRIETY_DATE_SET, {
  days_sober: daysSober,
});
```

**Step 6: Track onboarding completed**

In the handleComplete function:

```typescript
// Calculate duration
const durationSeconds = Math.floor((Date.now() - onboardingStartTime) / 1000);

trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
  duration_seconds: durationSeconds,
});
```

**Step 7: Update tests to mock analytics**

Add analytics mocks to the onboarding test file.

**Step 8: Run tests**

Run: `pnpm test -- __tests__/app/onboarding.test.tsx`

Expected: PASS

**Step 9: Run full validation**

Run: `pnpm format && pnpm lint && pnpm typecheck`

Expected: All pass

**Step 10: Commit**

```bash
git add app/onboarding.tsx __tests__/app/onboarding.test.tsx
git commit -m "feat(analytics): add onboarding event tracking"
```

---

## Task 10: Add Screen View Tracking

**Files:**

- Modify: `app/_layout.tsx`
- Test: Manual verification (navigation events)

**Step 1: Read current \_layout.tsx navigation handling**

Check how navigation state is currently handled.

**Step 2: Add screen tracking on navigation state change**

In the RootLayoutNav component, add navigation tracking:

```typescript
import { trackScreenView } from '@/lib/analytics';
import { usePathname } from 'expo-router';

// Inside RootLayoutNav component
const pathname = usePathname();
const previousPathname = useRef<string | null>(null);

useEffect(() => {
  if (pathname && pathname !== previousPathname.current) {
    // Convert pathname to screen name
    const screenName = pathname === '/' ? 'Home' : pathname.replace(/^\//, '').replace(/-/g, ' ');
    trackScreenView(screenName);
    previousPathname.current = pathname;
  }
}, [pathname]);
```

**Step 3: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS

**Step 4: Run full validation**

Run: `pnpm format && pnpm lint && pnpm typecheck && pnpm build:web`

Expected: All pass

**Step 5: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(analytics): add automatic screen view tracking"
```

---

## Task 11: Add Core Feature Event Tracking

**Files:**

- Modify: `app/(tabs)/tasks.tsx`
- Modify: `app/(tabs)/steps.tsx`
- Test: Update existing tests or add mocks

**Step 1: Add task event tracking**

In tasks.tsx, add tracking for:

- `task_viewed` - when user opens a task
- `task_started` - when user marks task in progress
- `task_completed` - when user completes a task

```typescript
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

// When task is viewed
trackEvent(AnalyticsEvents.TASK_VIEWED, { task_id: task.id });

// When task status changes to in_progress
trackEvent(AnalyticsEvents.TASK_STARTED, { task_id: task.id });

// When task status changes to completed
trackEvent(AnalyticsEvents.TASK_COMPLETED, {
  task_id: task.id,
  days_to_complete: calculateDaysToComplete(task),
});
```

**Step 2: Add step event tracking**

In steps.tsx, add tracking for:

- `step_viewed` - when user views a step

```typescript
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

// When step is selected/viewed
trackEvent(AnalyticsEvents.STEP_VIEWED, { step_number: stepNumber });
```

**Step 3: Run tests**

Run: `pnpm test`

Expected: PASS

**Step 4: Run full validation**

Run: `pnpm format && pnpm lint && pnpm typecheck`

Expected: All pass

**Step 5: Commit**

```bash
git add app/\(tabs\)/tasks.tsx app/\(tabs\)/steps.tsx
git commit -m "feat(analytics): add task and step event tracking"
```

---

## Task 12: Final Integration Testing

**Files:**

- All analytics-related files

**Step 1: Run full test suite**

Run: `pnpm test`

Expected: All tests pass, coverage meets 80% threshold

**Step 2: Run all validation checks**

Run: `pnpm format && pnpm lint && pnpm typecheck && pnpm build:web`

Expected: All pass

**Step 3: Manual testing checklist**

Test in development with `EXPO_PUBLIC_ANALYTICS_DEBUG=true`:

- [ ] App starts without errors
- [ ] Console shows "[Analytics] Firebase Analytics initialized"
- [ ] Sign in triggers `auth_login` event in console
- [ ] Sign up triggers `auth_sign_up` event in console
- [ ] Sign out triggers `auth_logout` event in console
- [ ] Navigating between tabs triggers `screen_view` events
- [ ] Onboarding flow tracks all events

**Step 4: Commit final changes**

```bash
git add -A
git commit -m "test(analytics): verify full analytics integration"
```

---

## Summary

| Task | Component        | Events Added                                           |
| ---- | ---------------- | ------------------------------------------------------ |
| 1    | Types            | TypeScript definitions                                 |
| 2    | Utils            | PII sanitization, bucket calculation                   |
| 3    | Dependencies     | Firebase packages, config files                        |
| 4    | Web Analytics    | Platform-specific implementation                       |
| 5    | Native Analytics | Platform-specific implementation                       |
| 6    | Unified Module   | Cross-platform API                                     |
| 7    | Root Layout      | Initialization                                         |
| 8    | AuthContext      | auth_login, auth_sign_up, auth_logout                  |
| 9    | Onboarding       | onboarding_started, step_completed, completed          |
| 10   | Navigation       | screen_view (automatic)                                |
| 11   | Features         | task_viewed, task_started, task_completed, step_viewed |
| 12   | Testing          | Full integration verification                          |
