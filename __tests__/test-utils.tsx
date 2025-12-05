import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Test utility to render components wrapped with any required providers.
 *
 * @param ui - The React element to render
 * @param options - Optional render options from React Native Testing Library
 * @returns The render result
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) {
  return render(
    <AuthProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </AuthProvider>,
    options
  );
}

const originalPlatform = Platform.OS;

/**
 * Helper to set Platform.OS for testing platform-specific behavior.
 * Remember to restore in afterEach using restorePlatformOS().
 *
 * @param os - The platform OS to set ('ios', 'android', or 'web')
 */
export function setPlatformOS(os: 'ios' | 'android' | 'web') {
  Object.defineProperty(Platform, 'OS', {
    value: os,
    writable: true,
    configurable: true,
  });
}

/**
 * Restores Platform.OS to its original value.
 * Use this in afterEach hooks to clean up platform mocks.
 */
export function restorePlatformOS() {
  Object.defineProperty(Platform, 'OS', {
    value: originalPlatform,
    writable: true,
    configurable: true,
  });
}
