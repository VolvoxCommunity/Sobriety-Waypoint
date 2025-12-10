// =============================================================================
// Imports
// =============================================================================
import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, BookOpen, TrendingUp, CheckSquare, User } from 'lucide-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/contexts/ThemeContext';
import type { SFSymbol } from 'sf-symbols-typescript';
import WebTopNav from '@/components/navigation/WebTopNav';

// Conditionally import native tabs only on mobile to avoid web bundling issues
// react-native-bottom-tabs uses native codegen which isn't available on web
const NativeTabs =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Platform.OS !== 'web' ? require('@/components/navigation/NativeBottomTabs').NativeTabs : null;

// Pre-load Android icons using Ionicons (only on Android)
// These are loaded synchronously to avoid flickering during navigation
const androidIcons =
  Platform.OS === 'android'
    ? {
        home: Ionicons.getImageSourceSync('home', 24),
        book: Ionicons.getImageSourceSync('book', 24),
        trending: Ionicons.getImageSourceSync('trending-up', 24),
        tasks: Ionicons.getImageSourceSync('checkbox', 24),
        profile: Ionicons.getImageSourceSync('person', 24),
      }
    : null;

// =============================================================================
// Types & Interfaces
// =============================================================================

/** Tab route configuration with SF Symbols (iOS) and Ionicons (Android) */
interface TabRoute {
  name: string;
  title: string;
  sfSymbol: SFSymbol;
  androidIconKey: keyof NonNullable<typeof androidIcons>;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

// =============================================================================
// Constants
// =============================================================================

/** Tab route configuration with SF Symbols (iOS) and Ionicons (Android) */
const tabRoutes: TabRoute[] = [
  {
    name: 'index',
    title: 'Home',
    sfSymbol: 'house.fill',
    androidIconKey: 'home',
    icon: Home,
  },
  {
    name: 'steps',
    title: 'Steps',
    sfSymbol: 'book.fill',
    androidIconKey: 'book',
    icon: BookOpen,
  },
  {
    name: 'journey',
    title: 'Journey',
    sfSymbol: 'chart.line.uptrend.xyaxis',
    androidIconKey: 'trending',
    icon: TrendingUp,
  },
  {
    name: 'tasks',
    title: 'Tasks',
    sfSymbol: 'checklist',
    androidIconKey: 'tasks',
    icon: CheckSquare,
  },
  {
    name: 'profile',
    title: 'Profile',
    sfSymbol: 'person.fill',
    androidIconKey: 'profile',
    icon: User,
  },
];

// =============================================================================
// Component
// =============================================================================

/**
 * Tab layout with platform-specific navigation.
 *
 * - iOS/Android: Native bottom tabs via react-native-bottom-tabs
 *   - iOS: UITabBarController with SF Symbols, native blur, and haptics
 *   - Android: BottomNavigationView with Material Design styling
 * - Web: Top navigation bar (bottom tabs hidden)
 *
 * @returns Tab navigator appropriate for current platform
 */
export default function TabLayout(): React.ReactElement {
  const { theme, isDark } = useTheme();

  // Web: Use top navigation instead of bottom tabs
  if (Platform.OS === 'web') {
    const webNavItems = tabRoutes.map((route) => ({
      route: route.name === 'index' ? '/' : `/${route.name}`,
      label: route.title,
      icon: route.icon,
    }));

    return (
      <>
        <WebTopNav items={webNavItems} />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          {tabRoutes.map((route) => (
            <Tabs.Screen key={route.name} name={route.name} />
          ))}
          {/* Hidden route - accessible via navigation but not shown in nav */}
          <Tabs.Screen name="manage-tasks" options={{ href: null }} />
        </Tabs>
      </>
    );
  }

  // Mobile: Native bottom tabs with platform-specific styling
  // Uses react-native-bottom-tabs for truly native tab bars:
  // - iOS: UITabBarController with SF Symbols and native blur
  // - Android: BottomNavigationView with Material Design
  return (
    <NativeTabs
      tabBarActiveTintColor={theme.primary}
      tabBarInactiveTintColor={theme.textSecondary}
      tabBarStyle={{
        backgroundColor: isDark ? theme.surface : theme.card,
      }}
    >
      {tabRoutes.map((route) => (
        <NativeTabs.Screen
          key={route.name}
          name={route.name}
          options={{
            title: route.title,
            // iOS uses SF Symbols, Android uses pre-loaded Ionicons
            tabBarIcon: () =>
              Platform.OS === 'ios'
                ? { sfSymbol: route.sfSymbol }
                : androidIcons![route.androidIconKey],
          }}
        />
      ))}
      {/* Hidden route - accessible via navigation but not shown in tab bar */}
      <NativeTabs.Screen
        name="manage-tasks"
        options={{
          title: 'Manage Tasks',
          tabBarItemHidden: true,
        }}
      />
    </NativeTabs>
  );
}
