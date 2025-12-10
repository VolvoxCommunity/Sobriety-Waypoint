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
 * Calculates the bottom padding needed for scrollable content above the tab bar.
 *
 * @param bottomInset - The bottom safe area inset from useSafeAreaInsets()
 * @param extraPadding - Additional padding to add (defaults to 16)
 * @returns The calculated padding for iOS, or extraPadding for other platforms
 *
 * @example
 * ```tsx
 * const insets = useSafeAreaInsets();
 * const paddingBottom = getTabBarScrollPadding(insets.bottom);
 * ```
 */
export function getTabBarScrollPadding(bottomInset: number, extraPadding: number = 16): number {
  return Platform.OS === 'ios' ? bottomInset + IOS_TAB_BAR_HEIGHT + extraPadding : extraPadding;
}
