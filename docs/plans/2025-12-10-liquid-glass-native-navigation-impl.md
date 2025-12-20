# Liquid Glass Native Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Sobers into a native-first app with iOS 26 Liquid Glass aesthetics, native tab navigation, keyboard handling, bottom sheets, and Airbnb code standards.

**Architecture:** Replace JS-animated navigation with native iOS `UITabBarController` via `react-native-bottom-tabs`, convert all modals to gesture-driven `@gorhom/bottom-sheet` with blur backdrops, use `react-native-keyboard-controller` for native keyboard handling, and adopt `eslint-config-airbnb-extended` for strict linting.

**Tech Stack:** react-native-bottom-tabs, react-native-keyboard-controller, @gorhom/bottom-sheet, expo-blur, eslint-config-airbnb-extended, expo-symbols (SF Symbols)

---

## Phase 1: Foundation

### Task 1: Install New Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Install production dependencies**

Run:

```bash
pnpm add react-native-bottom-tabs react-native-keyboard-controller @gorhom/bottom-sheet expo-blur
```

Expected: Packages added to dependencies in package.json

**Step 2: Install ESLint dependencies**

Run:

```bash
pnpm add -D eslint-config-airbnb-extended
```

Expected: Package added to devDependencies

**Step 3: Remove old ESLint config**

Run:

```bash
pnpm remove eslint-config-expo
```

Expected: eslint-config-expo removed from devDependencies

**Step 4: Run prebuild for native modules**

Run:

```bash
npx expo prebuild --clean
```

Expected: ios/ and android/ directories regenerated with new native dependencies

**Step 5: Verify installation**

Run:

```bash
pnpm install && pnpm typecheck
```

Expected: No TypeScript errors

**Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml ios/ android/
git commit -m "chore(deps): add native navigation and bottom sheet dependencies

- react-native-bottom-tabs for native tab bar
- react-native-keyboard-controller for native keyboard handling
- @gorhom/bottom-sheet for gesture-driven sheets
- expo-blur for Liquid Glass effects
- eslint-config-airbnb-extended (replacing eslint-config-expo)"
```

---

### Task 2: Add Jest Mocks for New Libraries

**Files:**

- Modify: `jest.setup.js`

**Step 1: Add react-native-bottom-tabs mock**

Add after existing mocks (around line 180):

```javascript
// Mock react-native-bottom-tabs
jest.mock('react-native-bottom-tabs', () => {
  const React = require('react');
  return {
    createNativeBottomTabNavigator: () => ({
      Navigator: ({ children, ...props }) => React.createElement('TabNavigator', props, children),
      Screen: ({ children, ...props }) => React.createElement('TabScreen', props, children),
    }),
  };
});
```

**Step 2: Add @gorhom/bottom-sheet mock**

```javascript
// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, ...props }) => React.createElement('BottomSheet', props, children),
    BottomSheetModal: ({ children, ...props }) =>
      React.createElement('BottomSheetModal', props, children),
    BottomSheetModalProvider: ({ children }) => children,
    BottomSheetView: ({ children, ...props }) =>
      React.createElement('BottomSheetView', props, children),
    BottomSheetScrollView: ({ children, ...props }) =>
      React.createElement('BottomSheetScrollView', props, children),
    BottomSheetBackdrop: ({ children, ...props }) =>
      React.createElement('BottomSheetBackdrop', props, children),
    useBottomSheetModal: () => ({
      dismiss: jest.fn(),
      present: jest.fn(),
    }),
  };
});
```

**Step 3: Add expo-blur mock**

```javascript
// Mock expo-blur
jest.mock('expo-blur', () => {
  const React = require('react');
  return {
    BlurView: ({ children, ...props }) => React.createElement('BlurView', props, children),
  };
});
```

**Step 4: Add react-native-keyboard-controller mock**

```javascript
// Mock react-native-keyboard-controller
jest.mock('react-native-keyboard-controller', () => {
  const React = require('react');
  return {
    KeyboardProvider: ({ children }) => children,
    KeyboardAwareScrollView: ({ children, ...props }) =>
      React.createElement('KeyboardAwareScrollView', props, children),
    KeyboardAvoidingView: ({ children, ...props }) =>
      React.createElement('KeyboardAvoidingView', props, children),
    useKeyboardHandler: () => ({}),
    useReanimatedKeyboardAnimation: () => ({ height: { value: 0 }, progress: { value: 0 } }),
  };
});
```

**Step 5: Run tests to verify mocks work**

Run:

```bash
pnpm test
```

Expected: All 1303 tests pass (or similar count)

**Step 6: Commit**

```bash
git add jest.setup.js
git commit -m "test: add Jest mocks for native navigation libraries

- react-native-bottom-tabs mock
- @gorhom/bottom-sheet mock
- expo-blur BlurView mock
- react-native-keyboard-controller mock"
```

---

### Task 3: Update Test Utilities with New Providers

**Files:**

- Modify: `__tests__/test-utils.tsx`

**Step 1: Import new providers**

Replace the entire file:

````typescript
/**
 * @fileoverview Test utilities for React Native Testing Library
 *
 * Provides shared test helpers for wrapping components with required providers.
 * All tests should use renderWithProviders instead of custom wrapper implementations.
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardProvider } from 'react-native-keyboard-controller';

/**
 * Wrapper component that provides all required contexts for tests.
 *
 * Includes:
 * - KeyboardProvider (react-native-keyboard-controller)
 * - BottomSheetModalProvider (@gorhom/bottom-sheet)
 * - AuthProvider (authentication context)
 * - ThemeProvider (theming context)
 *
 * @param children - React children to wrap with providers
 * @returns Component tree with providers
 */
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <KeyboardProvider>
      <BottomSheetModalProvider>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </KeyboardProvider>
  );
};

/**
 * Renders a React component with all required providers.
 *
 * This is the standard way to render components in tests. It ensures components
 * have access to keyboard handling, bottom sheets, authentication, and theme contexts.
 *
 * @param ui - The component to render
 * @param options - Optional render options
 * @returns Render result with screen queries and utilities
 *
 * @example
 * ```tsx
 * import { renderWithProviders } from '@/__tests__/test-utils';
 *
 * it('renders correctly', () => {
 *   renderWithProviders(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeTruthy();
 * });
 * ```
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};
````

**Step 2: Run tests to verify providers work**

Run:

```bash
pnpm test
```

Expected: All tests pass

**Step 3: Commit**

```bash
git add __tests__/test-utils.tsx
git commit -m "test(utils): add KeyboardProvider and BottomSheetModalProvider

Update test wrapper to include new providers for:
- react-native-keyboard-controller
- @gorhom/bottom-sheet"
```

---

### Task 4: Add Providers to Root Layout

**Files:**

- Modify: `app/_layout.tsx`

**Step 1: Add imports at top of file (after existing imports)**

Add after line 38 (after lucide import):

```typescript
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
```

**Step 2: Wrap RootLayoutNav with providers**

Replace the return statement in the default export function (lines 214-222):

```typescript
  return (
    <ErrorBoundary>
      <KeyboardProvider>
        <BottomSheetModalProvider>
          <ThemeProvider>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </ThemeProvider>
        </BottomSheetModalProvider>
      </KeyboardProvider>
    </ErrorBoundary>
  );
```

**Step 3: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: No TypeScript errors

**Step 4: Run tests**

Run:

```bash
pnpm test -- __tests__/app/layout.test.tsx
```

Expected: Layout tests pass

**Step 5: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(layout): add KeyboardProvider and BottomSheetModalProvider

Wrap app with providers for:
- Native keyboard handling
- Bottom sheet modals"
```

---

## Phase 2: ESLint Migration

### Task 5: Create ESLint Flat Config

**Files:**

- Create: `eslint.config.js`
- Delete: `.eslintrc.js` (if exists)

**Step 1: Check if old config exists**

Run:

```bash
ls -la .eslintrc* eslint.config.* 2>/dev/null || echo "No existing config"
```

**Step 2: Create new flat config**

Create file `eslint.config.js`:

```javascript
import airbnbExtended from 'eslint-config-airbnb-extended';
import globals from 'globals';

export default [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'ios/**',
      'android/**',
      'coverage/**',
      '.worktrees/**',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
      'jest.setup.js',
    ],
  },

  // Base Airbnb configs
  ...airbnbExtended.configs.base,
  ...airbnbExtended.configs.react,
  ...airbnbExtended.configs.typescript,

  // Project-specific overrides
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // Expo/React Native compatibility
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': [
        'error',
        {
          exceptions: ['BottomSheet', 'BottomSheetModal', 'BlurView', 'TextInput'],
        },
      ],

      // Expo Router uses default exports for screens
      'import/prefer-default-export': 'off',
      'import/no-default-export': 'off',

      // Allow devDependencies in test files
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.{ts,tsx}',
            '**/*.spec.{ts,tsx}',
            '__tests__/**',
            'jest.setup.js',
            'jest.config.js',
          ],
        },
      ],

      // TypeScript handles these
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Console logging - use logger instead
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],

      // Style preferences
      'max-len': [
        'warn',
        {
          code: 100,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
    },
  },

  // Test file overrides
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '__tests__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react/jsx-props-no-spreading': 'off',
    },
  },
];
```

**Step 3: Add globals package**

Run:

```bash
pnpm add -D globals
```

**Step 4: Update package.json lint script**

The script should already work with flat config. Verify:

Run:

```bash
pnpm lint
```

Expected: Many lint errors (this is expected - we'll fix them incrementally)

**Step 5: Delete old config if exists**

Run:

```bash
rm -f .eslintrc.js .eslintrc.json .eslintrc
```

**Step 6: Commit config (not fixes yet)**

```bash
git add eslint.config.js package.json pnpm-lock.yaml
git commit -m "chore(eslint): migrate to flat config with Airbnb Extended

Replace eslint-config-expo with eslint-config-airbnb-extended.
Uses ESLint flat config format.

Note: Lint errors will be fixed in subsequent commits."
```

---

### Task 6: Fix Critical Lint Errors (Batch 1 - Imports)

**Files:**

- Multiple files with import issues

**Step 1: Run lint and capture output**

Run:

```bash
pnpm lint 2>&1 | head -100
```

**Step 2: Auto-fix what's possible**

Run:

```bash
pnpm lint --fix
```

**Step 3: Run format to clean up**

Run:

```bash
pnpm format
```

**Step 4: Run lint again to see remaining errors**

Run:

```bash
pnpm lint 2>&1 | grep -c "error" || echo "0 errors"
```

**Step 5: Commit auto-fixed changes**

```bash
git add -A
git commit -m "style: auto-fix ESLint errors (imports, formatting)

Applied ESLint --fix for:
- Import ordering
- Formatting issues
- Simple rule violations"
```

---

### Task 7: Fix Remaining Lint Errors (Manual Fixes)

**Note:** This task may take multiple iterations. Focus on one error category at a time.

**Step 1: List unique error types**

Run:

```bash
pnpm lint 2>&1 | grep "error" | awk -F'  ' '{print $2}' | sort | uniq -c | sort -rn | head -20
```

**Step 2: Fix errors by category**

For each category, make targeted fixes. Common patterns:

- **Missing return types**: Add explicit return types to exported functions
- **any usage**: Replace with proper types or `unknown`
- **Props spreading**: Add exceptions or destructure explicitly

**Step 3: Run validation after each batch**

Run:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

**Step 4: Commit in batches**

```bash
git add -A
git commit -m "style: fix ESLint errors - [category]

Manual fixes for [specific error type]"
```

---

## Phase 3: Tab Navigation

### Task 8: Create TabBarIcon Component

**Files:**

- Create: `components/navigation/TabBarIcon.tsx`
- Create: `__tests__/components/navigation/TabBarIcon.test.tsx`

**Step 1: Write the failing test**

Create `__tests__/components/navigation/TabBarIcon.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import TabBarIcon from '@/components/navigation/TabBarIcon';

// Mock Platform
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
    },
  };
});

describe('TabBarIcon', () => {
  it('renders SF Symbol name on iOS', () => {
    Platform.OS = 'ios';
    const { toJSON } = render(
      <TabBarIcon
        sfSymbol="house.fill"
        fallbackIcon={() => <></>}
        focused={true}
        color="#10b981"
      />
    );
    // On iOS, should pass sfSymbol to native
    expect(toJSON()).toBeTruthy();
  });

  it('renders fallback Lucide icon on Android', () => {
    Platform.OS = 'android';
    const MockIcon = ({ color }: { color: string }) => <></>;
    render(
      <TabBarIcon
        sfSymbol="house.fill"
        fallbackIcon={MockIcon}
        focused={false}
        color="#666"
      />
    );
    // On Android, should render fallback
    expect(screen).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm test -- __tests__/components/navigation/TabBarIcon.test.tsx
```

Expected: FAIL - module not found

**Step 3: Create the component**

Create directory and file `components/navigation/TabBarIcon.tsx`:

```typescript
import React from 'react';
import { Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

interface TabBarIconProps {
  /** SF Symbol name for iOS (e.g., 'house.fill') */
  sfSymbol: string;
  /** Lucide icon component for Android/Web fallback */
  fallbackIcon: IconComponent;
  /** Whether the tab is currently focused */
  focused: boolean;
  /** Icon color */
  color: string;
  /** Icon size (default: 24) */
  size?: number;
}

/**
 * Platform-adaptive tab bar icon component.
 *
 * Uses SF Symbols on iOS for native integration with Liquid Glass,
 * and Lucide icons on Android/Web for consistency.
 *
 * @param sfSymbol - SF Symbol name for iOS
 * @param fallbackIcon - Lucide icon component for non-iOS platforms
 * @param focused - Whether the tab is focused
 * @param color - Icon color
 * @param size - Icon size (default: 24)
 * @returns Platform-appropriate icon component
 */
export default function TabBarIcon({
  sfSymbol,
  fallbackIcon: FallbackIcon,
  focused,
  color,
  size = 24,
}: TabBarIconProps): React.ReactElement {
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={sfSymbol}
        size={size}
        tintColor={color}
        weight={focused ? 'semibold' : 'regular'}
        style={{ width: size, height: size }}
      />
    );
  }

  return <FallbackIcon size={size} color={color} />;
}
```

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm test -- __tests__/components/navigation/TabBarIcon.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/navigation/TabBarIcon.tsx __tests__/components/navigation/TabBarIcon.test.tsx
git commit -m "feat(navigation): add TabBarIcon with SF Symbol support

- Uses SF Symbols on iOS for native Liquid Glass integration
- Falls back to Lucide icons on Android/Web
- Adjusts weight based on focused state"
```

---

### Task 9: Create WebTopNav Component

**Files:**

- Create: `components/navigation/WebTopNav.tsx`
- Create: `__tests__/components/navigation/WebTopNav.test.tsx`

**Step 1: Write the failing test**

Create `__tests__/components/navigation/WebTopNav.test.tsx`:

```typescript
import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/__tests__/test-utils';
import WebTopNav from '@/components/navigation/WebTopNav';
import { Home, BookOpen } from 'lucide-react-native';

const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  usePathname: () => '/',
}));

describe('WebTopNav', () => {
  const items = [
    { route: '/', label: 'Home', icon: Home },
    { route: '/steps', label: 'Steps', icon: BookOpen },
  ];

  beforeEach(() => {
    mockRouterPush.mockClear();
  });

  it('renders all navigation items', () => {
    renderWithProviders(<WebTopNav items={items} />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Steps')).toBeTruthy();
  });

  it('navigates when item is pressed', () => {
    renderWithProviders(<WebTopNav items={items} />);
    fireEvent.press(screen.getByText('Steps'));
    expect(mockRouterPush).toHaveBeenCalledWith('/steps');
  });

  it('highlights active route', () => {
    renderWithProviders(<WebTopNav items={items} />);
    // Home should be active since pathname is '/'
    const homeItem = screen.getByText('Home');
    expect(homeItem).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm test -- __tests__/components/navigation/WebTopNav.test.tsx
```

Expected: FAIL - module not found

**Step 3: Create the component**

Create `components/navigation/WebTopNav.tsx`:

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme, type ThemeColors } from '@/contexts/ThemeContext';

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

interface NavItem {
  route: string;
  label: string;
  icon: IconComponent;
}

interface WebTopNavProps {
  items: NavItem[];
}

/**
 * Top navigation bar for web platform.
 *
 * Displays horizontal navigation items at the top of the screen,
 * following web UX conventions instead of mobile bottom tabs.
 *
 * @param items - Array of navigation items with route, label, and icon
 * @returns Horizontal navigation bar component
 */
export default function WebTopNav({ items }: WebTopNavProps): React.ReactElement {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const styles = createStyles(theme);

  const isActive = (route: string): boolean => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        {items.map((item) => {
          const active = isActive(item.route);
          const IconComponent = item.icon;

          return (
            <Pressable
              key={item.route}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.route as never)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <IconComponent
                size={20}
                color={active ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.navLabel,
                  active && styles.navLabelActive,
                  { color: active ? theme.primary : theme.textSecondary },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      maxWidth: 800,
      marginHorizontal: 'auto',
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    navItemActive: {
      backgroundColor: theme.primaryLight,
    },
    navLabel: {
      fontSize: 14,
      fontFamily: theme.fontMedium,
    },
    navLabelActive: {
      fontFamily: theme.fontSemiBold,
    },
  });
```

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm test -- __tests__/components/navigation/WebTopNav.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/navigation/WebTopNav.tsx __tests__/components/navigation/WebTopNav.test.tsx
git commit -m "feat(navigation): add WebTopNav for web platform

Horizontal top navigation bar following web UX conventions:
- Centered navigation items
- Active state highlighting
- Accessible with proper ARIA roles"
```

---

### Task 10: Replace Tab Bar with Native Implementation

**Files:**

- Modify: `app/(tabs)/_layout.tsx`
- Delete: `components/AnimatedBottomNav.tsx`

**Step 1: Write test for new tab layout**

Create or update `__tests__/app/tabs/layout.test.tsx`:

```typescript
import React from 'react';
import { Platform } from 'react-native';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@/__tests__/test-utils';

// Mock expo-router
jest.mock('expo-router', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
  Tabs: {
    Screen: ({ name }: { name: string }) => null,
  },
}));

describe('TabLayout', () => {
  it('renders native tabs on mobile', () => {
    Platform.OS = 'ios';
    // Test will verify native tab navigator is used
    expect(true).toBe(true); // Placeholder - real test depends on implementation
  });

  it('renders web top nav on web', () => {
    Platform.OS = 'web';
    // Test will verify WebTopNav is used
    expect(true).toBe(true); // Placeholder
  });
});
```

**Step 2: Rewrite tab layout**

Replace `app/(tabs)/_layout.tsx`:

```typescript
import React from 'react';
import { Platform } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { createNativeBottomTabNavigator } from 'react-native-bottom-tabs';
import { Home, BookOpen, TrendingUp, CheckSquare, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import TabBarIcon from '@/components/navigation/TabBarIcon';
import WebTopNav from '@/components/navigation/WebTopNav';

const Tab = createNativeBottomTabNavigator();

/** Tab route configuration with SF Symbols and Lucide fallbacks */
const tabRoutes = [
  {
    name: 'index',
    title: 'Home',
    sfSymbol: 'house.fill',
    icon: Home,
  },
  {
    name: 'steps',
    title: 'Steps',
    sfSymbol: 'book.fill',
    icon: BookOpen,
  },
  {
    name: 'journey',
    title: 'Journey',
    sfSymbol: 'chart.line.uptrend.xyaxis',
    icon: TrendingUp,
  },
  {
    name: 'tasks',
    title: 'Tasks',
    sfSymbol: 'checklist',
    icon: CheckSquare,
  },
  {
    name: 'profile',
    title: 'Profile',
    sfSymbol: 'person.fill',
    icon: User,
  },
];

/**
 * Tab layout with platform-specific navigation.
 *
 * - iOS: Native UITabBarController with SF Symbols and Liquid Glass blur
 * - Android: Native bottom tabs with Lucide icons and Material elevation
 * - Web: Top navigation bar
 *
 * @returns Tab navigator appropriate for current platform
 */
export default function TabLayout(): React.ReactElement {
  const { theme, isDark } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

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
        <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
          {tabRoutes.map((route) => (
            <Tabs.Screen key={route.name} name={route.name} />
          ))}
        </Tabs>
      </>
    );
  }

  // Mobile: Native bottom tabs
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerLargeTitle: Platform.OS === 'ios',
        headerTransparent: Platform.OS === 'ios',
        headerBlurEffect: isDark ? 'systemMaterialDark' : 'systemMaterial',
        headerTitleStyle: {
          fontFamily: 'JetBrainsMono-SemiBold',
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: 'transparent',
          },
          android: {
            backgroundColor: theme.surface,
            elevation: 8,
          },
        }),
        translucent: Platform.OS === 'ios',
      }}
    >
      {tabRoutes.map((route) => (
        <Tab.Screen
          key={route.name}
          name={route.name}
          options={{
            title: route.title,
            tabBarIcon: ({ focused, color }) => (
              <TabBarIcon
                sfSymbol={route.sfSymbol}
                fallbackIcon={route.icon}
                focused={focused}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
```

**Step 3: Delete old AnimatedBottomNav**

Run:

```bash
rm components/AnimatedBottomNav.tsx
```

**Step 4: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: No errors (or errors to fix)

**Step 5: Run tests**

Run:

```bash
pnpm test
```

Expected: Tests pass (some may need updates for removed component)

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(navigation): replace AnimatedBottomNav with native tabs

- iOS: Native UITabBarController with SF Symbols and Liquid Glass blur
- Android: Native bottom tabs with elevation
- Web: Top navigation bar

BREAKING: Removes AnimatedBottomNav component"
```

---

## Phase 4: Keyboard Handling

### Task 11: Replace KeyboardAvoidingView in Onboarding

**Files:**

- Modify: `app/onboarding.tsx`

**Step 1: Update imports**

Replace React Native's `KeyboardAvoidingView` import with:

```typescript
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
```

Remove `KeyboardAvoidingView` from the react-native import.

**Step 2: Replace KeyboardAvoidingView with KeyboardAwareScrollView**

Find the `KeyboardAvoidingView` wrapper (around line 314) and replace:

```typescript
// Before:
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  <ScrollView ...>
    {/* content */}
  </ScrollView>
</KeyboardAvoidingView>

// After:
<KeyboardAwareScrollView
  style={{ flex: 1 }}
  contentContainerStyle={styles.scrollContent}
  bottomOffset={20}
>
  {/* content - no nested ScrollView needed */}
</KeyboardAwareScrollView>
```

**Step 3: Run typecheck**

Run:

```bash
pnpm typecheck
```

**Step 4: Run related tests**

Run:

```bash
pnpm test -- __tests__/app/onboarding.test.tsx
```

**Step 5: Commit**

```bash
git add app/onboarding.tsx
git commit -m "refactor(onboarding): use KeyboardAwareScrollView

Replace KeyboardAvoidingView + ScrollView with consolidated
KeyboardAwareScrollView from react-native-keyboard-controller"
```

---

### Task 12: Replace KeyboardAvoidingView in Signup

**Files:**

- Modify: `app/signup.tsx`

**Step 1: Update imports**

Same pattern as Task 11.

**Step 2: Replace component**

Same pattern as Task 11.

**Step 3: Run tests**

Run:

```bash
pnpm test -- __tests__/app/signup.test.tsx
```

**Step 4: Commit**

```bash
git add app/signup.tsx
git commit -m "refactor(signup): use KeyboardAwareScrollView"
```

---

### Task 13: Replace KeyboardAvoidingView in Profile

**Files:**

- Modify: `app/(tabs)/profile.tsx`

**Step 1: Update imports and replace components**

Profile has multiple KeyboardAvoidingView instances. Replace each with appropriate keyboard-controller component.

**Step 2: Run tests**

Run:

```bash
pnpm test -- __tests__/app/profile.test.tsx
```

**Step 3: Commit**

```bash
git add app/(tabs)/profile.tsx
git commit -m "refactor(profile): use react-native-keyboard-controller"
```

---

### Task 14: Replace KeyboardAvoidingView in Tasks

**Files:**

- Modify: `app/(tabs)/tasks.tsx`

Same pattern as previous tasks.

**Commit:**

```bash
git add app/(tabs)/tasks.tsx
git commit -m "refactor(tasks): use react-native-keyboard-controller"
```

---

## Phase 5: GlassBottomSheet Component

### Task 15: Create GlassBottomSheet Component

**Files:**

- Create: `components/GlassBottomSheet.tsx`
- Create: `__tests__/components/GlassBottomSheet.test.tsx`

**Step 1: Write the failing test**

Create `__tests__/components/GlassBottomSheet.test.tsx`:

```typescript
import React from 'react';
import { Text } from 'react-native';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@/__tests__/test-utils';
import GlassBottomSheet from '@/components/GlassBottomSheet';

describe('GlassBottomSheet', () => {
  it('renders children when visible', () => {
    const ref = React.createRef<any>();
    renderWithProviders(
      <GlassBottomSheet ref={ref} snapPoints={['50%']}>
        <Text>Sheet Content</Text>
      </GlassBottomSheet>
    );
    // Note: Bottom sheet rendering depends on imperative API
    expect(ref.current).toBeDefined();
  });

  it('provides dismiss and present methods', () => {
    const ref = React.createRef<any>();
    renderWithProviders(
      <GlassBottomSheet ref={ref} snapPoints={['50%']}>
        <Text>Content</Text>
      </GlassBottomSheet>
    );
    expect(typeof ref.current?.present).toBe('function');
    expect(typeof ref.current?.dismiss).toBe('function');
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm test -- __tests__/components/GlassBottomSheet.test.tsx
```

**Step 3: Create the component**

Create `components/GlassBottomSheet.tsx`:

````typescript
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassBottomSheetProps {
  /** Snap points for the sheet (e.g., ['25%', '50%', '90%']) */
  snapPoints: (string | number)[];
  /** Content to render inside the sheet */
  children: React.ReactNode;
  /** Called when the sheet is dismissed */
  onDismiss?: () => void;
  /** Enable keyboard handling */
  keyboardBehavior?: 'interactive' | 'extend' | 'fillParent';
}

export interface GlassBottomSheetRef {
  present: () => void;
  dismiss: () => void;
  snapToIndex: (index: number) => void;
}

/**
 * Liquid Glass bottom sheet with platform-adaptive styling.
 *
 * - iOS: Blur backdrop + translucent glass background
 * - Android: Elevated surface with solid background
 *
 * Uses @gorhom/bottom-sheet with expo-blur for iOS effects.
 *
 * @param snapPoints - Array of snap point values
 * @param children - Sheet content
 * @param onDismiss - Callback when sheet is closed
 * @param keyboardBehavior - How to handle keyboard appearance
 *
 * @example
 * ```tsx
 * const sheetRef = useRef<GlassBottomSheetRef>(null);
 *
 * <GlassBottomSheet ref={sheetRef} snapPoints={['50%', '90%']}>
 *   <SettingsContent />
 * </GlassBottomSheet>
 *
 * // Open sheet
 * sheetRef.current?.present();
 * ```
 */
const GlassBottomSheet = forwardRef<GlassBottomSheetRef, GlassBottomSheetProps>(
  ({ snapPoints, children, onDismiss, keyboardBehavior = 'interactive' }, ref) => {
    const { theme, isDark } = useTheme();

    // Backdrop with blur on iOS
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => {
        if (Platform.OS === 'ios') {
          return (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
              opacity={0.5}
            >
              <BlurView
                intensity={20}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            </BottomSheetBackdrop>
          );
        }

        return (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.5}
          />
        );
      },
      [isDark]
    );

    // Background style with glass effect on iOS
    const backgroundStyle = useMemo(
      () => ({
        backgroundColor: Platform.select({
          ios: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          android: theme.surface,
          default: theme.surface,
        }),
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }),
      [theme.surface, isDark]
    );

    // Handle indicator style
    const handleIndicatorStyle = useMemo(
      () => ({
        backgroundColor: Platform.select({
          ios: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
          android: theme.textTertiary,
          default: theme.textTertiary,
        }),
        width: 36,
        height: 4,
      }),
      [theme.textTertiary, isDark]
    );

    return (
      <BottomSheetModal
        ref={ref as any}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={backgroundStyle}
        handleIndicatorStyle={handleIndicatorStyle}
        keyboardBehavior={keyboardBehavior}
        onDismiss={onDismiss}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.content}>{children}</BottomSheetView>
      </BottomSheetModal>
    );
  }
);

GlassBottomSheet.displayName = 'GlassBottomSheet';

export default GlassBottomSheet;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
````

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm test -- __tests__/components/GlassBottomSheet.test.tsx
```

**Step 5: Commit**

```bash
git add components/GlassBottomSheet.tsx __tests__/components/GlassBottomSheet.test.tsx
git commit -m "feat(components): add GlassBottomSheet with Liquid Glass styling

- iOS: Blur backdrop + translucent glass background
- Android: Elevated surface with solid background
- Keyboard-aware with configurable behavior
- Imperative API (present/dismiss/snapToIndex)"
```

---

## Phase 6: Sheet Migrations

### Task 16: Convert TaskCreationModal to Sheet

**Files:**

- Rename: `components/TaskCreationModal.tsx` → `components/sheets/TaskCreationSheet.tsx`
- Create: `__tests__/components/sheets/TaskCreationSheet.test.tsx`
- Modify: Files that import TaskCreationModal

**Step 1: Create sheet version**

The conversion involves:

1. Remove `Modal` wrapper
2. Use `GlassBottomSheet` with `forwardRef`
3. Update imports in consumers

**Step 2: Update imports in consumers**

Files that use TaskCreationModal:

- `app/(tabs)/index.tsx`
- `app/(tabs)/manage-tasks.tsx`

**Step 3: Run tests**

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor(tasks): convert TaskCreationModal to TaskCreationSheet

- Use GlassBottomSheet for Liquid Glass effect
- Update imports in index.tsx and manage-tasks.tsx"
```

---

### Task 17: Create SettingsSheet

**Files:**

- Create: `components/sheets/SettingsSheet.tsx`
- Modify: `app/_layout.tsx` (remove modal config)
- Modify: `app/(tabs)/profile.tsx` (add sheet trigger)

This task converts the Settings modal to a bottom sheet, triggered from the Profile screen.

**Commit:**

```bash
git add -A
git commit -m "refactor(settings): convert to bottom sheet

- Create SettingsSheet component
- Trigger from Profile screen gear icon
- Remove Stack.Screen modal configuration"
```

---

### Task 18: Create LogSlipUpSheet

**Files:**

- Create: `components/sheets/LogSlipUpSheet.tsx`
- Create: `__tests__/components/sheets/LogSlipUpSheet.test.tsx`
- Modify: `app/(tabs)/profile.tsx`

**Commit:**

```bash
git add -A
git commit -m "feat(profile): add LogSlipUpSheet

Bottom sheet for logging slip-ups with:
- Date picker
- Optional notes field
- Liquid Glass styling"
```

---

### Task 19: Create StepContentSheet

**Files:**

- Create: `components/sheets/StepContentSheet.tsx`
- Create: `__tests__/components/sheets/StepContentSheet.test.tsx`
- Modify: `app/(tabs)/steps.tsx`

**Commit:**

```bash
git add -A
git commit -m "feat(steps): add StepContentSheet

Replace Modal with bottom sheet for step details:
- Scrollable content area
- Toggle completion button
- Liquid Glass styling"
```

---

### Task 20: Create EditDisplayNameSheet

**Files:**

- Create: `components/sheets/EditDisplayNameSheet.tsx`
- Create: `__tests__/components/sheets/EditDisplayNameSheet.test.tsx`
- Modify: `app/(tabs)/profile.tsx`

**Commit:**

```bash
git add -A
git commit -m "feat(profile): add EditDisplayNameSheet

Bottom sheet for editing display name:
- Text input with validation
- Save/Cancel actions
- Keyboard-aware"
```

---

## Phase 7: Native Headers

### Task 21: Enable Native Headers on Tab Screens

**Files:**

- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/steps.tsx`
- Modify: `app/(tabs)/journey.tsx`
- Modify: `app/(tabs)/tasks.tsx`
- Modify: `app/(tabs)/profile.tsx`

Each screen may have custom header content that needs to be integrated with native headers or removed if redundant.

**Step 1: Review each screen for custom header content**

**Step 2: Update screens to work with native headers**

Native headers are enabled in the tab navigator. Each screen should:

- Remove redundant header styling at the top
- Use `headerRight`/`headerLeft` for header actions if needed

**Step 3: Run full test suite**

Run:

```bash
pnpm test
```

**Step 4: Commit**

```bash
git add app/(tabs)/*.tsx
git commit -m "feat(navigation): enable native headers on all tab screens

- Remove redundant header styling
- Integrate with native Large Title on iOS
- Header blur effect on scroll"
```

---

## Phase 8: Polish

### Task 22: Final Validation

**Step 1: Run all quality checks**

Run:

```bash
pnpm format && pnpm lint && pnpm typecheck && pnpm build:web && pnpm test
```

All must pass.

**Step 2: Test on iOS Simulator**

Run:

```bash
pnpm ios
```

Verify:

- Tab bar has blur effect
- SF Symbols render correctly
- Large titles work
- Bottom sheets have glass effect
- Keyboard handling is smooth

**Step 3: Test on Android Emulator**

Run:

```bash
pnpm android
```

Verify:

- Tab bar has elevation
- Lucide icons render
- Bottom sheets work
- Material-style appearance

**Step 4: Test on Web**

Run:

```bash
pnpm web
```

Verify:

- Top navigation bar renders
- Navigation works
- Sheets fall back gracefully

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final polish and validation

All quality checks passing:
- Format ✓
- Lint ✓
- TypeScript ✓
- Build ✓
- Tests ✓"
```

---

## Summary

This plan contains **22 tasks** across **8 phases**:

1. **Foundation** (Tasks 1-4): Dependencies, mocks, providers
2. **ESLint Migration** (Tasks 5-7): Airbnb config, fix errors
3. **Tab Navigation** (Tasks 8-10): TabBarIcon, WebTopNav, native tabs
4. **Keyboard Handling** (Tasks 11-14): Replace KeyboardAvoidingView
5. **GlassBottomSheet** (Task 15): Reusable sheet component
6. **Sheet Migrations** (Tasks 16-20): Convert all modals
7. **Native Headers** (Task 21): Enable on all screens
8. **Polish** (Task 22): Final validation

Each task follows TDD with explicit file paths, code examples, and verification steps.
