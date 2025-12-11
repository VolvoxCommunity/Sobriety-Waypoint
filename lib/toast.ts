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
