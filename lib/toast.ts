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
function createToastRenderer(type: 'success' | 'error' | 'info', IconComponent: typeof Check) {
  return function ToastRenderer({ text1 }: ToastConfigParams<ToastProps>) {
    // Note: We use light theme colors by default since we can't use hooks here.
    // The toast will still look good in dark mode due to the strong border accent.
    const colors = COLORS[type].light;

    return React.createElement(
      View,
      {
        style: [
          styles.container,
          { backgroundColor: colors.background, borderLeftColor: colors.border },
        ],
      },
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
