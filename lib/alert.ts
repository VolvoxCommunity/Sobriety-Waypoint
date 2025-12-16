import { Alert, Platform } from 'react-native';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Button configuration for native Alert dialogs.
 * Maps to React Native's AlertButton type.
 */
export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

// =============================================================================
// Alert Utilities
// =============================================================================

/**
 * Shows a platform-appropriate alert dialog.
 * Uses window.alert() on web, Alert.alert() on native.
 *
 * @param title - Alert title (used on native, prepended to message on web)
 * @param message - Optional alert message body
 * @param buttons - Optional button configuration (native only, web ignores this)
 *
 * @example
 * ```ts
 * // Simple alert
 * showAlert('Success', 'Your profile has been updated');
 *
 * // Error alert
 * showAlert('Error', 'Failed to save changes');
 *
 * // With custom buttons (native only)
 * showAlert('Warning', 'Are you sure?', [
 *   { text: 'Cancel', style: 'cancel' },
 *   { text: 'OK', onPress: () => handleOk() }
 * ]);
 * ```
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS === 'web') {
    // On web, combine title and message for window.alert
    // Format: "Title: Message" or just "Title" if no message
    const alertText = message ? `${title}: ${message}` : title;
    window.alert(alertText);
  } else {
    Alert.alert(title, message, buttons);
  }
}

/**
 * Shows a confirmation dialog with Cancel/Confirm buttons.
 * Returns a promise that resolves to true if confirmed, false if cancelled.
 *
 * @param title - Confirmation dialog title
 * @param message - Confirmation dialog message
 * @param confirmText - Text for confirm button (default: 'Confirm')
 * @param cancelText - Text for cancel button (default: 'Cancel')
 * @param destructive - Whether confirm action is destructive (default: false)
 * @returns Promise resolving to true if confirmed, false if cancelled
 *
 * @example
 * ```ts
 * // Simple confirmation
 * const confirmed = await showConfirm('Delete Task', 'Are you sure?');
 * if (confirmed) {
 *   await deleteTask();
 * }
 *
 * // Destructive confirmation
 * const confirmed = await showConfirm(
 *   'Delete Account',
 *   'This action cannot be undone.',
 *   'Delete',
 *   'Cancel',
 *   true
 * );
 * ```
 */
export async function showConfirm(
  title: string,
  message: string,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false
): Promise<boolean> {
  if (Platform.OS === 'web') {
    // On web, combine title and message for window.confirm
    const confirmMessage = `${title}\n\n${message}`;
    return window.confirm(confirmMessage);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}
