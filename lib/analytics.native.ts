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
import { logger, LogCategory } from '@/lib/logger';

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
      logger.info('Firebase Analytics initialized for native', {
        category: LogCategory.ANALYTICS,
      });
    }
  } catch (error) {
    logger.error(
      'Failed to initialize native analytics',
      error instanceof Error ? error : new Error(String(error)),
      { category: LogCategory.ANALYTICS }
    );
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
      logger.debug(`Event: ${eventName}`, { category: LogCategory.ANALYTICS, ...params });
    }

    await analytics().logEvent(eventName, params);
  } catch (error) {
    logger.error(
      `Failed to track event ${eventName}`,
      error instanceof Error ? error : new Error(String(error)),
      { category: LogCategory.ANALYTICS }
    );
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
      logger.debug(`setUserId: ${userId}`, { category: LogCategory.ANALYTICS });
    }

    await analytics().setUserId(userId);
  } catch (error) {
    logger.error(
      'Failed to set user ID',
      error instanceof Error ? error : new Error(String(error)),
      { category: LogCategory.ANALYTICS }
    );
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
      logger.debug('setUserProperties', { category: LogCategory.ANALYTICS, ...properties });
    }

    // React Native Firebase expects string | null for property values
    await analytics().setUserProperties(properties as Record<string, string | null>);
  } catch (error) {
    logger.error(
      'Failed to set user properties',
      error instanceof Error ? error : new Error(String(error)),
      { category: LogCategory.ANALYTICS }
    );
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
      logger.debug(`Screen view: ${screenName}`, { category: LogCategory.ANALYTICS });
    }

    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    logger.error(
      'Failed to track screen view',
      error instanceof Error ? error : new Error(String(error)),
      { category: LogCategory.ANALYTICS }
    );
  }
}

/**
 * Resets analytics for logout.
 * Clears user ID and any user-specific data.
 */
export async function resetAnalyticsNative(): Promise<void> {
  try {
    if (isDebugMode()) {
      logger.info('Resetting analytics state', { category: LogCategory.ANALYTICS });
    }

    await analytics().resetAnalyticsData();
  } catch (error) {
    logger.error(
      'Failed to reset analytics',
      error instanceof Error ? error : new Error(String(error)),
      { category: LogCategory.ANALYTICS }
    );
  }
}
