// =============================================================================
// Layout Constants
// =============================================================================
// Shared layout constants used across the app for consistent spacing and sizing

import { Platform } from 'react-native';

/**
 * Default iOS tab bar height in points.
 * Used to calculate safe scroll padding when content appears above the tab bar.
 *
 * @remarks
 * This value matches the standard UITabBar height (49pt) on iOS.
 * On Android, the navigation bar height varies and is handled differently.
 */
export const IOS_TAB_BAR_HEIGHT = 49;

/**
 * Default extra padding above tab bar on iOS.
 * Used to add comfortable spacing between content and the tab bar.
 */
export const IOS_TAB_BAR_EXTRA_PADDING = 16;

/**
 * Default extra padding above navigation on Android.
 * Android typically needs more padding since tab bar height is not fixed.
 */
export const ANDROID_TAB_BAR_EXTRA_PADDING = 24;

/**
 * Calculates the bottom padding needed for scrollable content above the tab bar.
 *
 * @param bottomInset - The bottom safe area inset from useSafeAreaInsets()
 * @param extraPadding - Additional padding to add (defaults to platform-specific value)
 * @returns The calculated padding for iOS, or extraPadding for other platforms
 *
 * @example
 * ```tsx
 * const insets = useSafeAreaInsets();
 * const paddingBottom = getTabBarScrollPadding(insets.bottom);
 * ```
 */
export function getTabBarScrollPadding(
  bottomInset: number,
  extraPadding: number = Platform.OS === 'ios'
    ? IOS_TAB_BAR_EXTRA_PADDING
    : ANDROID_TAB_BAR_EXTRA_PADDING
): number {
  return Platform.OS === 'ios' ? bottomInset + IOS_TAB_BAR_HEIGHT + extraPadding : extraPadding;
}
