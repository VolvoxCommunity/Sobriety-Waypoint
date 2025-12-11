// =============================================================================
// Web Stub for NativeBottomTabs
// =============================================================================

/**
 * Web stub for NativeBottomTabs.
 *
 * On web, we use WebTopNav instead of native bottom tabs.
 * This stub exists to prevent bundler errors when importing NativeBottomTabs
 * in shared code that checks Platform.OS before using it.
 *
 * The actual web navigation is handled by WebTopNav in app/(tabs)/_layout.tsx.
 */

// Export null - web should never actually use this component
export const NativeTabs = null;

// Type export for compatibility
export type NativeBottomTabNavigationOptions = Record<string, unknown>;
