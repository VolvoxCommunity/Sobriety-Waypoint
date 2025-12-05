// =============================================================================
// Imports
// =============================================================================
import React from 'react';
import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import LandingPage from '@/components/landing/LandingPage';

// =============================================================================
// Component
// =============================================================================

/**
 * Root index route that serves as the entry point for the app.
 *
 * On web platforms, displays the landing page for new visitors. On native platforms,
 * immediately redirects to the login screen to enter the authenticated flow.
 *
 * @returns Landing page for web or redirect for native platforms
 */
export default function Index() {
  // On native platforms, redirect immediately to login screen
  // This bypasses the landing page which is web-only
  if (Platform.OS !== 'web') {
    return <Redirect href="/login" />;
  }

  // On web, show the marketing landing page
  return <LandingPage />;
}
