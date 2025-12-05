// Initialize Sentry before anything else using centralized configuration
import { initializeSentry, navigationIntegration, wrapRootComponent } from '@/lib/sentry';

// Initialize Sentry once with centralized configuration from lib/sentry.ts
// This handles environment detection, privacy hooks, and all integrations
initializeSentry();
/* eslint-disable import/first -- Sentry must initialize before React components load */
import { useEffect } from 'react';
import {
  Stack,
  useRouter,
  useSegments,
  SplashScreen,
  useNavigationContainerRef,
  useRootNavigationState,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
/* eslint-enable import/first */

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Controls app routing and renders the root navigation UI based on authentication and profile state.
 *
 * Observes authentication, profile completeness, and current route segments to perform routing guards
 * (redirecting to `/login`, `/onboarding`, or `/(tabs)` as appropriate). While auth state is loading,
 * displays a centered loading indicator. When not loading, renders the app's Stack navigator and StatusBar.
 *
 * @returns The root navigation JSX element containing the app's Stack and StatusBar
 */
function RootLayoutNav() {
  const { user, profile, loading } = useAuth();
  const { isDark, theme } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const rootNavigationState = useRootNavigationState();

  // Check if the navigator is ready before attempting navigation
  // This prevents "action was not handled by any navigator" warnings
  const navigatorReady = rootNavigationState?.key != null;

  // Register navigation container with Sentry
  useEffect(() => {
    if (navigationRef) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  useEffect(() => {
    // Wait for both auth loading to complete AND navigator to be ready
    if (loading || !navigatorReady) return;

    const isWeb = Platform.OS === 'web';
    const firstSegment = segments[0];
    const hasSegments = segments.length > 0;

    const inAuthGroup = firstSegment === '(tabs)';
    const inOnboarding = firstSegment === 'onboarding';
    const inAuthScreen = firstSegment === 'login' || firstSegment === 'signup';
    const inLanding = firstSegment === 'index';

    // Profile is complete when user has provided their name and sobriety date during onboarding
    // Check for non-null values (null indicates user hasn't completed onboarding).
    // Also validate against placeholder values ('User', 'U') to catch legacy data or edge cases.
    const hasName =
      profile !== null &&
      profile.first_name !== null &&
      profile.last_initial !== null &&
      profile.first_name !== 'User' &&
      profile.last_initial !== 'U';
    const hasSobrietyDate = !!profile?.sobriety_date;
    const isProfileComplete = hasName && hasSobrietyDate;

    // On web, allow landing page to show for unauthenticated users
    // This allows the landing page to be accessible without login/signin
    if (isWeb && inLanding && !user) {
      // Allow landing page to render on web for unauthenticated users - don't redirect
      return;
    }

    // On web, if no segments (initial load at root), allow landing page to show for unauthenticated users
    if (isWeb && !hasSegments && !user) {
      // Allow landing page to render on initial web load - don't redirect
      return;
    }

    // Redirect unauthenticated users trying to access protected routes
    if (!user && inAuthGroup) {
      router.replace('/login');
    } else if (!user && hasSegments && !inAuthScreen && !(inLanding && isWeb)) {
      // Allow unauthenticated users to view landing page ONLY on web
      // On native, redirect to login (landing page is web-only)
      router.replace('/login');
    } else if (
      user &&
      profile &&
      isProfileComplete &&
      hasSegments &&
      (inAuthScreen || inOnboarding || (inLanding && isWeb))
    ) {
      // Redirect authenticated users with complete profiles away from landing/auth screens
      // Landing page is web-only, so only redirect if on web
      router.replace('/(tabs)');
    } else if (user && profile && !isProfileComplete && !inOnboarding) {
      router.replace('/onboarding');
    } else if (user && !profile && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [user, profile, segments, loading, router, navigatorReady]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator testID="loading-indicator" size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'formSheet',
            gestureEnabled: true,
            contentStyle: { backgroundColor: theme.background },
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default wrapRootComponent(function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
    'JetBrainsMono-Medium': JetBrainsMono_500Medium,
    'JetBrainsMono-SemiBold': JetBrainsMono_600SemiBold,
    'JetBrainsMono-Bold': JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});
