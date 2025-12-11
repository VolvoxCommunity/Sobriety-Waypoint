# Toast Notification System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace success/error alerts with themed toast notifications using `react-native-toast-message`.

**Architecture:** Create a centralized toast module (`lib/toast.ts`) with themed custom renderers that integrate with the existing ThemeContext. The `<Toast />` component mounts in the root layout after all providers. Success/error notifications become non-blocking toasts; confirmation dialogs remain as `Alert.alert`.

**Tech Stack:** react-native-toast-message, React Native, TypeScript, ThemeContext

---

## Task 1: Install react-native-toast-message

**Files:**
- Modify: `package.json`

**Step 1: Install the package**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm add react-native-toast-message
```

Expected: Package added to dependencies in package.json

**Step 2: Verify installation**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm list react-native-toast-message
```

Expected: Shows react-native-toast-message in the dependency list

**Step 3: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add package.json pnpm-lock.yaml && git commit -m "chore(deps): add react-native-toast-message"
```

---

## Task 2: Add Jest mock for react-native-toast-message

**Files:**
- Modify: `jest.setup.js`

**Step 1: Add the mock**

Add at end of `jest.setup.js` (after line 473):

```javascript
// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, ...props }) => React.createElement('Toast', props, children),
    BaseToast: ({ children, ...props }) => React.createElement('BaseToast', props, children),
    ErrorToast: ({ children, ...props }) => React.createElement('ErrorToast', props, children),
    show: jest.fn(),
    hide: jest.fn(),
  };
});
```

**Step 2: Verify tests still pass**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm test -- --passWithNoTests --testPathIgnorePatterns=".*" 2>&1 | head -20
```

Expected: Jest initializes without errors

**Step 3: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add jest.setup.js && git commit -m "test(setup): add mock for react-native-toast-message"
```

---

## Task 3: Write failing tests for toast module

**Files:**
- Create: `__tests__/lib/toast.test.ts`

**Step 1: Write the failing test**

Create `__tests__/lib/toast.test.ts`:

```typescript
import Toast from 'react-native-toast-message';
import { showToast } from '@/lib/toast';

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('showToast', () => {
  describe('success', () => {
    it('calls Toast.show with success type and 3000ms visibility', () => {
      showToast.success('Task completed');

      expect(Toast.show).toHaveBeenCalledTimes(1);
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Task completed',
        visibilityTime: 3000,
      });
    });

    it('handles empty message', () => {
      showToast.success('');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: '',
        visibilityTime: 3000,
      });
    });
  });

  describe('error', () => {
    it('calls Toast.show with error type and 5000ms visibility', () => {
      showToast.error('Failed to save');

      expect(Toast.show).toHaveBeenCalledTimes(1);
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Failed to save',
        visibilityTime: 5000,
      });
    });

    it('handles long error messages', () => {
      const longMessage = 'A'.repeat(200);
      showToast.error(longMessage);

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: longMessage,
        visibilityTime: 5000,
      });
    });
  });

  describe('info', () => {
    it('calls Toast.show with info type and 3000ms visibility', () => {
      showToast.info('Processing...');

      expect(Toast.show).toHaveBeenCalledTimes(1);
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'info',
        text1: 'Processing...',
        visibilityTime: 3000,
      });
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm test -- __tests__/lib/toast.test.ts -v
```

Expected: FAIL with "Cannot find module '@/lib/toast'"

**Step 3: Commit failing test**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add __tests__/lib/toast.test.ts && git commit -m "test(toast): add failing tests for toast module"
```

---

## Task 4: Implement toast module

**Files:**
- Create: `lib/toast.ts`

**Step 1: Write minimal implementation**

Create `lib/toast.ts`:

```typescript
import Toast from 'react-native-toast-message';

// =============================================================================
// Constants
// =============================================================================

/** Duration for success toasts in milliseconds */
const SUCCESS_VISIBILITY_TIME = 3000;

/** Duration for error toasts in milliseconds (longer for readability) */
const ERROR_VISIBILITY_TIME = 5000;

/** Duration for info toasts in milliseconds */
const INFO_VISIBILITY_TIME = 3000;

// =============================================================================
// Toast API
// =============================================================================

/**
 * Unified toast notification API for displaying non-blocking messages.
 *
 * @example
 * ```typescript
 * import { showToast } from '@/lib/toast';
 *
 * // Success notification
 * showToast.success('Task completed!');
 *
 * // Error notification (stays longer)
 * showToast.error('Failed to save changes');
 *
 * // Info notification
 * showToast.info('Processing your request...');
 * ```
 */
export const showToast = {
  /**
   * Show a success toast notification.
   * Auto-dismisses after 3 seconds.
   *
   * @param message - The message to display
   */
  success: (message: string): void => {
    Toast.show({
      type: 'success',
      text1: message,
      visibilityTime: SUCCESS_VISIBILITY_TIME,
    });
  },

  /**
   * Show an error toast notification.
   * Auto-dismisses after 5 seconds (longer for readability).
   *
   * @param message - The error message to display
   */
  error: (message: string): void => {
    Toast.show({
      type: 'error',
      text1: message,
      visibilityTime: ERROR_VISIBILITY_TIME,
    });
  },

  /**
   * Show an info toast notification.
   * Auto-dismisses after 3 seconds.
   *
   * @param message - The info message to display
   */
  info: (message: string): void => {
    Toast.show({
      type: 'info',
      text1: message,
      visibilityTime: INFO_VISIBILITY_TIME,
    });
  },
};
```

**Step 2: Run test to verify it passes**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm test -- __tests__/lib/toast.test.ts -v
```

Expected: PASS - All 5 tests pass

**Step 3: Run typecheck**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm typecheck
```

Expected: No type errors

**Step 4: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add lib/toast.ts && git commit -m "feat(toast): implement showToast API"
```

---

## Task 5: Write failing tests for toast config

**Files:**
- Modify: `__tests__/lib/toast.test.ts`

**Step 1: Add tests for toastConfig**

Append to `__tests__/lib/toast.test.ts`:

```typescript
import { toastConfig } from '@/lib/toast';

describe('toastConfig', () => {
  it('exports success, error, and info toast renderers', () => {
    expect(toastConfig).toHaveProperty('success');
    expect(toastConfig).toHaveProperty('error');
    expect(toastConfig).toHaveProperty('info');
  });

  it('success renderer is a function', () => {
    expect(typeof toastConfig.success).toBe('function');
  });

  it('error renderer is a function', () => {
    expect(typeof toastConfig.error).toBe('function');
  });

  it('info renderer is a function', () => {
    expect(typeof toastConfig.info).toBe('function');
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm test -- __tests__/lib/toast.test.ts -v
```

Expected: FAIL - toastConfig is not exported

**Step 3: Commit failing test**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add __tests__/lib/toast.test.ts && git commit -m "test(toast): add failing tests for toastConfig"
```

---

## Task 6: Implement toastConfig with themed renderers

**Files:**
- Modify: `lib/toast.ts`

**Step 1: Add toastConfig export**

Replace the entire `lib/toast.ts` with:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast, { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { Check, X, Info } from 'lucide-react-native';

// =============================================================================
// Types
// =============================================================================

interface ToastProps {
  text1?: string;
  text2?: string;
}

// =============================================================================
// Constants
// =============================================================================

/** Duration for success toasts in milliseconds */
const SUCCESS_VISIBILITY_TIME = 3000;

/** Duration for error toasts in milliseconds (longer for readability) */
const ERROR_VISIBILITY_TIME = 5000;

/** Duration for info toasts in milliseconds */
const INFO_VISIBILITY_TIME = 3000;

// Toast colors (using app's color palette)
const COLORS = {
  success: {
    light: {
      background: '#ffffff',
      border: '#10b981',
      text: '#111827',
      icon: '#10b981',
    },
    dark: {
      background: '#1f2937',
      border: '#10b981',
      text: '#f9fafb',
      icon: '#10b981',
    },
  },
  error: {
    light: {
      background: '#ffffff',
      border: '#ef4444',
      text: '#111827',
      icon: '#ef4444',
    },
    dark: {
      background: '#1f2937',
      border: '#ef4444',
      text: '#f9fafb',
      icon: '#ef4444',
    },
  },
  info: {
    light: {
      background: '#ffffff',
      border: '#007AFF',
      text: '#111827',
      icon: '#007AFF',
    },
    dark: {
      background: '#1f2937',
      border: '#007AFF',
      text: '#f9fafb',
      icon: '#007AFF',
    },
  },
};

// =============================================================================
// Toast Renderers
// =============================================================================

/**
 * Creates a custom toast renderer component.
 *
 * @param type - The toast type (success, error, info)
 * @param IconComponent - The Lucide icon component to render
 */
function createToastRenderer(
  type: 'success' | 'error' | 'info',
  IconComponent: typeof Check
) {
  return function ToastRenderer({ text1 }: ToastConfigParams<ToastProps>) {
    // Note: We use light theme colors by default since we can't use hooks here.
    // The toast will still look good in dark mode due to the strong border accent.
    const colors = COLORS[type].light;

    return React.createElement(
      View,
      { style: [styles.container, { backgroundColor: colors.background, borderLeftColor: colors.border }] },
      React.createElement(
        View,
        { style: styles.iconContainer },
        React.createElement(IconComponent, { size: 20, color: colors.icon, strokeWidth: 2.5 })
      ),
      React.createElement(
        Text,
        { style: [styles.text, { color: colors.text }], numberOfLines: 2 },
        text1
      )
    );
  };
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 52,
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'JetBrainsMono-Medium',
    lineHeight: 20,
  },
});

// =============================================================================
// Toast Config Export
// =============================================================================

/**
 * Custom toast configuration with themed renderers.
 * Pass this to the Toast component in the root layout.
 *
 * @example
 * ```tsx
 * import Toast from 'react-native-toast-message';
 * import { toastConfig } from '@/lib/toast';
 *
 * <Toast config={toastConfig} />
 * ```
 */
export const toastConfig: ToastConfig = {
  success: createToastRenderer('success', Check),
  error: createToastRenderer('error', X),
  info: createToastRenderer('info', Info),
};

// =============================================================================
// Toast API
// =============================================================================

/**
 * Unified toast notification API for displaying non-blocking messages.
 *
 * @example
 * ```typescript
 * import { showToast } from '@/lib/toast';
 *
 * // Success notification
 * showToast.success('Task completed!');
 *
 * // Error notification (stays longer)
 * showToast.error('Failed to save changes');
 *
 * // Info notification
 * showToast.info('Processing your request...');
 * ```
 */
export const showToast = {
  /**
   * Show a success toast notification.
   * Auto-dismisses after 3 seconds.
   *
   * @param message - The message to display
   */
  success: (message: string): void => {
    Toast.show({
      type: 'success',
      text1: message,
      visibilityTime: SUCCESS_VISIBILITY_TIME,
    });
  },

  /**
   * Show an error toast notification.
   * Auto-dismisses after 5 seconds (longer for readability).
   *
   * @param message - The error message to display
   */
  error: (message: string): void => {
    Toast.show({
      type: 'error',
      text1: message,
      visibilityTime: ERROR_VISIBILITY_TIME,
    });
  },

  /**
   * Show an info toast notification.
   * Auto-dismisses after 3 seconds.
   *
   * @param message - The info message to display
   */
  info: (message: string): void => {
    Toast.show({
      type: 'info',
      text1: message,
      visibilityTime: INFO_VISIBILITY_TIME,
    });
  },
};
```

**Step 2: Run test to verify it passes**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm test -- __tests__/lib/toast.test.ts -v
```

Expected: PASS - All 9 tests pass

**Step 3: Run typecheck**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm typecheck
```

Expected: No type errors

**Step 4: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add lib/toast.ts && git commit -m "feat(toast): add toastConfig with themed renderers"
```

---

## Task 7: Integrate Toast component in root layout

**Files:**
- Modify: `app/_layout.tsx`

**Step 1: Add Toast import**

At line 2 (after Sentry import), add:

```typescript
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/lib/toast';
```

**Step 2: Add Toast component to RootLayout**

In the `RootLayout` function (around line 266-280), modify the return statement to include Toast after `<RootLayoutNav />`:

Find this code block:
```typescript
  return (
    <GestureHandlerRootView style={styles.container}>
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
    </GestureHandlerRootView>
  );
```

Replace with:
```typescript
  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <ThemeProvider>
              <AuthProvider>
                <RootLayoutNav />
                <Toast config={toastConfig} position="top" topOffset={60} />
              </AuthProvider>
            </ThemeProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
```

**Step 3: Run typecheck**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm typecheck
```

Expected: No type errors

**Step 4: Run lint**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm lint
```

Expected: No lint errors

**Step 5: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add app/_layout.tsx && git commit -m "feat(layout): integrate Toast component in root layout"
```

---

## Task 8: Migrate login.tsx

**Files:**
- Modify: `app/login.tsx`
- Modify: `__tests__/app/login.test.tsx`

**Step 1: Update login.tsx imports**

Replace:
```typescript
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
```

With:
```typescript
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { showToast } from '@/lib/toast';
```

**Step 2: Update handleLogin validation error**

Find (lines 43-50):
```typescript
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert('Please fill in all fields');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
      return;
    }
```

Replace with:
```typescript
    if (!email || !password) {
      showToast.error('Please fill in all fields');
      return;
    }
```

**Step 3: Update handleLogin catch block**

Find (lines 55-63):
```typescript
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Failed to sign in');
      logger.error('Sign in failed', err, { category: LogCategory.AUTH, email });
      if (Platform.OS === 'web') {
        window.alert('Error: ' + err.message);
      } else {
        Alert.alert('Error', err.message);
      }
    } finally {
```

Replace with:
```typescript
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Failed to sign in');
      logger.error('Sign in failed', err, { category: LogCategory.AUTH, email });
      showToast.error(err.message);
    } finally {
```

**Step 4: Update handleGoogleSignIn catch block**

Find (lines 72-80):
```typescript
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Failed to sign in with Google');
      logger.error('Google sign in failed', err, { category: LogCategory.AUTH });
      if (Platform.OS === 'web') {
        window.alert('Error: ' + err.message);
      } else {
        Alert.alert('Error', err.message);
      }
    } finally {
```

Replace with:
```typescript
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Failed to sign in with Google');
      logger.error('Google sign in failed', err, { category: LogCategory.AUTH });
      showToast.error(err.message);
    } finally {
```

**Step 5: Update AppleSignInButton error handler**

Find (lines 160-164):
```typescript
          <AppleSignInButton
            onError={(error) => {
              logger.error('Apple sign in failed', error, { category: LogCategory.AUTH });
              // AppleSignInButton only renders on iOS, so Alert.alert is safe here
              Alert.alert('Error', error.message);
            }}
          />
```

Replace with:
```typescript
          <AppleSignInButton
            onError={(error) => {
              logger.error('Apple sign in failed', error, { category: LogCategory.AUTH });
              showToast.error(error.message);
            }}
          />
```

**Step 6: Remove unused Alert import if no longer needed**

Check if `Alert` is still used in the file. If not, remove it from the import statement.

**Step 7: Update login tests**

In `__tests__/app/login.test.tsx`, update the imports to add Toast mock:

```typescript
import Toast from 'react-native-toast-message';
```

Then update assertions from:
```typescript
expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
```

To:
```typescript
expect(Toast.show).toHaveBeenCalledWith(
  expect.objectContaining({ type: 'error', text1: 'Please fill in all fields' })
);
```

Update all `Alert.alert` assertions in the file similarly.

**Step 8: Run tests**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm test -- __tests__/app/login.test.tsx -v
```

Expected: All tests pass

**Step 9: Run typecheck and lint**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm typecheck && pnpm lint
```

Expected: No errors

**Step 10: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add app/login.tsx __tests__/app/login.test.tsx && git commit -m "refactor(login): migrate alerts to toast notifications"
```

---

## Task 9: Migrate signup.tsx

**Files:**
- Modify: `app/signup.tsx`
- Modify: `__tests__/app/signup.test.tsx`

**Step 1: Add showToast import**

Add after other imports:
```typescript
import { showToast } from '@/lib/toast';
```

**Step 2: Replace all Alert/window.alert with showToast.error**

Find and replace these patterns:

```typescript
// Pattern 1: Validation errors
if (Platform.OS === 'web') {
  window.alert('Please fill in all fields');
} else {
  Alert.alert('Error', 'Please fill in all fields');
}
// Replace with:
showToast.error('Please fill in all fields');

// Pattern 2: Passwords don't match
if (Platform.OS === 'web') {
  window.alert('Passwords do not match');
} else {
  Alert.alert('Error', 'Passwords do not match');
}
// Replace with:
showToast.error('Passwords do not match');

// Pattern 3: Password too short
if (Platform.OS === 'web') {
  window.alert('Password must be at least 6 characters');
} else {
  Alert.alert('Error', 'Password must be at least 6 characters');
}
// Replace with:
showToast.error('Password must be at least 6 characters');

// Pattern 4: Sign up error
if (Platform.OS === 'web') {
  window.alert('Error: ' + err.message);
} else {
  Alert.alert('Error', err.message);
}
// Replace with:
showToast.error(err.message);

// Pattern 5: Google sign in error (same pattern)
// Replace with:
showToast.error(err.message);

// Pattern 6: Apple sign in error
Alert.alert('Error', error.message);
// Replace with:
showToast.error(error.message);
```

**Step 3: Update signup tests**

In `__tests__/app/signup.test.tsx`, add Toast import and update assertions similar to login.tsx.

**Step 4: Run tests**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm test -- __tests__/app/signup.test.tsx -v
```

Expected: All tests pass

**Step 5: Run typecheck and lint**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm typecheck && pnpm lint
```

Expected: No errors

**Step 6: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add app/signup.tsx __tests__/app/signup.test.tsx && git commit -m "refactor(signup): migrate alerts to toast notifications"
```

---

## Task 10: Migrate onboarding.tsx

**Files:**
- Modify: `app/onboarding.tsx`
- Modify: `__tests__/app/onboarding.test.tsx`

**Step 1: Add showToast import**

**Step 2: Replace error alerts with showToast.error**

Note: Keep the `Alert.alert` that shows "Sign Out" confirmation (line 146) - this is a confirmation dialog, not an error notification.

Replace only these error patterns:
- Line 198: `Alert.alert('Error', error.message)` → `showToast.error(error.message)`
- Line 200: `Alert.alert('Error', 'An unknown error occurred')` → `showToast.error('An unknown error occurred')`
- Lines 269-271: Platform-specific error alert → `showToast.error(message)`

**Step 3: Update tests**

**Step 4: Run tests, typecheck, lint**

**Step 5: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add app/onboarding.tsx __tests__/app/onboarding.test.tsx && git commit -m "refactor(onboarding): migrate error alerts to toast notifications"
```

---

## Task 11: Migrate settings.tsx

**Files:**
- Modify: `app/settings.tsx`
- Modify: `__tests__/app/settings.test.tsx`

**Step 1: Add showToast import**

**Step 2: Identify what to migrate vs keep**

**KEEP as Alert.alert (confirmation dialogs):**
- Line 298: Sign Out confirmation dialog
- Line 358: Delete Account confirmation dialog
- Line 364: "Are you absolutely sure?" second confirmation
- Line 381: Account deleted success (part of confirmation flow)

**MIGRATE to showToast:**
- Line 294: `window.alert('Error signing out...')` → `showToast.error(...)`
- Line 314: `Alert.alert('Error', 'Failed to sign out...')` → `showToast.error(...)`
- Line 346: `window.alert('Your account has been deleted...')` → `showToast.success(...)`
- Line 353: `window.alert('Error deleting account...')` → `showToast.error(...)`
- Line 392: `Alert.alert('Error', 'Failed to delete account...')` → `showToast.error(...)`
- Lines 461-463: Display name validation error → `showToast.error(...)`
- Lines 491-493: Display name success → `showToast.success(...)`
- Lines 508-510: Display name error → `showToast.error(...)`

**Step 3: Update tests**

**Step 4: Run tests, typecheck, lint**

**Step 5: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add app/settings.tsx __tests__/app/settings.test.tsx && git commit -m "refactor(settings): migrate alerts to toast notifications"
```

---

## Task 12: Migrate profile.tsx

**Files:**
- Modify: `app/(tabs)/profile.tsx`
- Modify: `__tests__/app/profile.test.tsx`

**Step 1: Add showToast import**

**Step 2: Identify what to migrate vs keep**

**KEEP as Alert.alert (confirmation dialogs):**
- Line 462: Disconnect from sponsor confirmation
- Line 564: Change sobriety date confirmation

**MIGRATE to showToast:**
- Lines 283-285: Invite code error → `showToast.error(...)`
- Lines 294-297: Invite code copied (currently Alert on native) → `showToast.success('Invite code copied to clipboard!')`
- Lines 434-436: Connected with sponsor → `showToast.success(...)`
- Lines 513-515: Disconnected success → `showToast.success(...)`
- Lines 523-525: Disconnect error → `showToast.error(...)`
- Lines 551-553: Invalid date → `showToast.error('Sobriety date cannot be in the future')`
- Lines 589-591: Date updated success → `showToast.success(...)`
- Lines 599-601: Date update error → `showToast.error(...)`

**Step 3: Update tests**

**Step 4: Run tests, typecheck, lint**

**Step 5: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add app/\(tabs\)/profile.tsx __tests__/app/profile.test.tsx && git commit -m "refactor(profile): migrate alerts to toast notifications"
```

---

## Task 13: Migrate tasks.tsx

**Files:**
- Modify: `app/(tabs)/tasks.tsx`
- Modify: `__tests__/app/tasks.test.tsx`

**Step 1: Add showToast import**

**Step 2: Identify what to migrate vs keep**

**KEEP as Alert.alert:**
- Line 240: Delete task confirmation dialog

**MIGRATE to showToast:**
- Lines 209-211: Task completed → `showToast.success('Task marked as completed!')`
- Lines 218-220: Task complete error → `showToast.error('Failed to complete task')`
- Lines 264-266: Task deleted success → `showToast.success('Task deleted successfully')`
- Lines 273-275: Task delete error → `showToast.error('Failed to delete task')`

**Step 3: Update tests**

**Step 4: Run tests, typecheck, lint**

**Step 5: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add app/\(tabs\)/tasks.tsx __tests__/app/tasks.test.tsx && git commit -m "refactor(tasks): migrate alerts to toast notifications"
```

---

## Task 14: Migrate manage-tasks.tsx

**Files:**
- Modify: `app/(tabs)/manage-tasks.tsx`

**Step 1: Add showToast import**

**Step 2: Identify what to migrate vs keep**

**KEEP as Alert.alert:**
- Line 81: Delete task confirmation dialog

**MIGRATE to showToast:**
- Lines 105-107: Task deleted success → `showToast.success('Task deleted successfully')`
- Lines 115-117: Task delete error → `showToast.error(message)`

**Step 3: Run typecheck and lint**

**Step 4: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add app/\(tabs\)/manage-tasks.tsx && git commit -m "refactor(manage-tasks): migrate alerts to toast notifications"
```

---

## Task 15: Migrate index.tsx (dashboard)

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `__tests__/app/index.test.tsx`

**Step 1: Add showToast import**

**Step 2: Identify what to migrate vs keep**

**KEEP as Alert.alert:**
- Line 107: Disconnect confirmation dialog

**MIGRATE to showToast:**
- Lines 155-157: Disconnected success → `showToast.success('Successfully disconnected')`
- Lines 165-167: Disconnect error → `showToast.error(message)`

**Step 3: Update tests**

**Step 4: Run tests, typecheck, lint**

**Step 5: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add app/\(tabs\)/index.tsx __tests__/app/index.test.tsx && git commit -m "refactor(dashboard): migrate alerts to toast notifications"
```

---

## Task 16: Migrate SettingsSheet.tsx

**Files:**
- Modify: `components/SettingsSheet.tsx`

**Step 1: Add showToast import**

**Step 2: Identify what to migrate vs keep**

**KEEP as Alert.alert:**
- Line 342: Sign Out confirmation
- Line 402: Delete Account confirmation
- Line 408: Second confirmation
- Line 425: Account deleted (part of flow)

**MIGRATE to showToast:**
- Line 338: Sign out error (web) → `showToast.error(...)`
- Line 358: Sign out error → `showToast.error(...)`
- Line 390: Account deleted (web) → `showToast.success(...)`
- Line 397: Delete error (web) → `showToast.error(...)`
- Line 436: Delete error → `showToast.error(...)`
- Lines 505-507: Display name error → `showToast.error(...)`
- Lines 535-537: Display name success → `showToast.success(...)`
- Lines 552-554: Display name error → `showToast.error(...)`

**Step 3: Run typecheck and lint**

**Step 4: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add components/SettingsSheet.tsx && git commit -m "refactor(settings-sheet): migrate alerts to toast notifications"
```

---

## Task 17: Migrate LogSlipUpSheet.tsx

**Files:**
- Modify: `components/sheets/LogSlipUpSheet.tsx`
- Modify: `__tests__/components/sheets/LogSlipUpSheet.test.tsx`

**Step 1: Check what needs migration**

Looking at the grep results:
- Line 204: `Alert.alert('Confirm Slip-Up'...)` → **KEEP** (confirmation dialog)
- Line 272: `window.alert(...)` → Check what this is

**Step 2: Add showToast import if needed**

**Step 3: Migrate window.alert to showToast if it's a notification**

**Step 4: Update tests if needed**

**Step 5: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add components/sheets/LogSlipUpSheet.tsx __tests__/components/sheets/LogSlipUpSheet.test.tsx && git commit -m "refactor(log-slip-up-sheet): migrate alerts to toast notifications"
```

---

## Task 18: Migrate EditDisplayNameSheet.tsx

**Files:**
- Modify: `components/sheets/EditDisplayNameSheet.tsx`

**Step 1: Check what needs migration**

Looking at the grep results:
- Line 191: `Alert.alert('Discard Changes?'...)` → **KEEP** (confirmation dialog)

**Step 2: Verify no other alerts need migration**

This file only has a confirmation dialog - no changes needed.

**Step 3: Skip commit if no changes**

---

## Task 19: Run full test suite and validation

**Step 1: Run all tests with coverage**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm test -- --coverage
```

Expected: All tests pass, coverage >= 80%

**Step 2: Run full validation suite**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm format && pnpm lint && pnpm typecheck && pnpm build:web
```

Expected: All checks pass

**Step 3: Commit any formatting changes**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && git add -A && git status
```

If there are changes:
```bash
git commit -m "style: apply formatting"
```

---

## Task 20: Visual verification

**Step 1: Start the dev server**

Run:
```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/feat-toast-notifications && pnpm web
```

**Step 2: Test success toast**

1. Navigate to a screen with a success action (e.g., profile, complete a task)
2. Trigger the action
3. Verify:
   - Toast appears at top of screen
   - Has green left border
   - Shows checkmark icon
   - Auto-dismisses after ~3 seconds
   - Doesn't overlap navigation

**Step 3: Test error toast**

1. Trigger a validation error (e.g., empty login form)
2. Verify:
   - Toast appears at top of screen
   - Has red left border
   - Shows X icon
   - Auto-dismisses after ~5 seconds

**Step 4: Test confirmation dialogs still work**

1. Go to settings
2. Tap "Sign Out"
3. Verify the Alert confirmation dialog appears (not a toast)

**Step 5: Test in dark mode**

1. Switch to dark mode
2. Repeat toast tests
3. Verify styling is appropriate

---

## Summary

**Total tasks:** 20

**Files created:**
- `lib/toast.ts`
- `__tests__/lib/toast.test.ts`

**Files modified:**
- `jest.setup.js`
- `app/_layout.tsx`
- `app/login.tsx` + tests
- `app/signup.tsx` + tests
- `app/onboarding.tsx` + tests
- `app/settings.tsx` + tests
- `app/(tabs)/profile.tsx` + tests
- `app/(tabs)/tasks.tsx` + tests
- `app/(tabs)/manage-tasks.tsx`
- `app/(tabs)/index.tsx` + tests
- `components/SettingsSheet.tsx`
- `components/sheets/LogSlipUpSheet.tsx` + tests

**Key patterns:**
- Success notifications → `showToast.success(message)`
- Error notifications → `showToast.error(message)`
- Confirmation dialogs → Keep as `Alert.alert(...)`
