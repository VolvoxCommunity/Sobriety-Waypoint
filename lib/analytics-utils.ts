// lib/analytics-utils.ts
/**
 * Utility functions for Amplitude Analytics.
 *
 * These helpers handle PII sanitization, bucket calculations,
 * and initialization checks.
 *
 * @module lib/analytics-utils
 */

import type { EventParams, DaysSoberBucket, StepsCompletedBucket } from '@/types/analytics';

/**
 * PII fields that must be stripped from analytics events.
 * These fields could identify users and must never be sent to analytics.
 */
const PII_FIELDS = [
  'email',
  'name',
  'display_name',
  'phone',
  'password',
  'token',
  'access_token',
  'refresh_token',
  'sobriety_date',
  'relapse_date',
] as const;

/**
 * Maximum recursion depth to prevent infinite loops.
 */
const MAX_DEPTH = 10;

/**
 * Recursively removes PII fields from event parameters at any depth.
 */
function sanitizeValue(
  value: unknown,
  visited: WeakSet<object> = new WeakSet(),
  depth: number = 0
): unknown {
  if (depth > MAX_DEPTH) return value;
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, visited, depth + 1));
  }

  if (typeof value === 'object') {
    if (visited.has(value)) return undefined;
    visited.add(value);

    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (PII_FIELDS.includes(key as (typeof PII_FIELDS)[number])) continue;
      sanitized[key] = sanitizeValue(val, visited, depth + 1);
    }

    visited.delete(value);
    return sanitized;
  }

  return value;
}

/**
 * Removes PII fields from event parameters before sending to analytics.
 */
export function sanitizeParams(params: EventParams | undefined): EventParams {
  if (!params) return {};
  const sanitized = sanitizeValue(params) as EventParams;
  return sanitized || {};
}

/**
 * Calculates the appropriate bucket for days sober.
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
 * Calculates the appropriate bucket for steps completed.
 */
export function calculateStepsCompletedBucket(count: number): StepsCompletedBucket {
  if (count <= 0) return '0';
  if (count <= 3) return '1-3';
  if (count <= 6) return '4-6';
  if (count <= 9) return '7-9';
  return '10-12';
}

/**
 * Checks if Amplitude Analytics should be initialized.
 * Returns true if the API key is configured.
 */
export function shouldInitializeAnalytics(): boolean {
  const apiKey = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY?.trim();
  return Boolean(apiKey && apiKey.length > 0);
}

/**
 * Checks if the app is running in debug mode.
 */
export function isDebugMode(): boolean {
  return __DEV__ || process.env.EXPO_PUBLIC_ANALYTICS_DEBUG === 'true';
}

/**
 * Gets the current environment for analytics tagging.
 */
export function getAnalyticsEnvironment(): string {
  if (__DEV__) return 'development';
  return process.env.EXPO_PUBLIC_APP_ENV || 'production';
}
