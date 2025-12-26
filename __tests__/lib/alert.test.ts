/**
 * Tests for alert module public API and fallback implementation.
 *
 * Platform-specific tests are in:
 * - alert.native.test.ts (iOS/Android)
 * - alert.web.test.ts (Web)
 */

// Test that types are exported correctly
import type { AlertButton } from '@/lib/alert';

// Import the public API functions after the mock is set up
import { showAlert, showConfirm } from '@/lib/alert';

// Mock logger for fallback implementation - must be before requireActual
const mockLoggerWarn = jest.fn();
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
  },
  LogCategory: {
    NAVIGATION: 'navigation',
  },
}));

// Get the actual fallback platform implementation (bypasses the global mock)
// We need to use requireActual since jest.setup.js mocks @/lib/alert/platform
const { showAlertPlatform, showConfirmPlatform } = jest.requireActual(
  '@/lib/alert/platform'
) as typeof import('@/lib/alert/platform');

// Override the platform mock for this test file to make showConfirm resolve immediately
const mockShowAlertPlatform = jest.fn();
const mockShowConfirmPlatform = jest.fn().mockResolvedValue(false);

jest.mock('@/lib/alert/platform', () => ({
  showAlertPlatform: (...args: unknown[]) => mockShowAlertPlatform(...args),
  showConfirmPlatform: (...args: unknown[]) => mockShowConfirmPlatform(...args),
}));

describe('Alert Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Type exports', () => {
    it('exports AlertButton type', () => {
      // TypeScript compile-time check - if this compiles, the type is exported
      const button: AlertButton = {
        text: 'OK',
        style: 'default',
        onPress: () => {},
      };
      expect(button.text).toBe('OK');
    });
  });

  describe('Public API - showAlert', () => {
    it('calls platform implementation with all parameters', () => {
      showAlert('Title', 'Message', [{ text: 'OK' }]);
      expect(mockShowAlertPlatform).toHaveBeenCalledWith('Title', 'Message', [{ text: 'OK' }]);
    });

    it('calls platform implementation with title only', () => {
      showAlert('Title');
      expect(mockShowAlertPlatform).toHaveBeenCalledWith('Title', undefined, undefined);
    });

    it('calls platform implementation with title and message', () => {
      showAlert('Title', 'Message');
      expect(mockShowAlertPlatform).toHaveBeenCalledWith('Title', 'Message', undefined);
    });
  });

  describe('Public API - showConfirm', () => {
    it('uses default confirm text when not specified', async () => {
      // This tests the default parameter: confirmText = 'Confirm'
      const result = await showConfirm('Title', 'Message');
      expect(result).toBe(false);
      expect(mockShowConfirmPlatform).toHaveBeenCalledWith(
        'Title',
        'Message',
        'Confirm',
        'Cancel',
        false
      );
    });

    it('uses default cancel text when not specified', async () => {
      // This tests the default parameter: cancelText = 'Cancel'
      const result = await showConfirm('Title', 'Message', 'OK');
      expect(result).toBe(false);
      expect(mockShowConfirmPlatform).toHaveBeenCalledWith(
        'Title',
        'Message',
        'OK',
        'Cancel',
        false
      );
    });

    it('uses default destructive value when not specified', async () => {
      // This tests the default parameter: destructive = false
      const result = await showConfirm('Title', 'Message', 'OK', 'No');
      expect(result).toBe(false);
      expect(mockShowConfirmPlatform).toHaveBeenCalledWith('Title', 'Message', 'OK', 'No', false);
    });

    it('calls with all parameters specified', async () => {
      const result = await showConfirm('Title', 'Message', 'Delete', 'Keep', true);
      expect(result).toBe(false);
      expect(mockShowConfirmPlatform).toHaveBeenCalledWith(
        'Title',
        'Message',
        'Delete',
        'Keep',
        true
      );
    });
  });

  describe('Fallback Platform Implementation', () => {
    describe('showAlertPlatform', () => {
      it('logs a warning with title and message', () => {
        showAlertPlatform('Test Title', 'Test message');

        expect(mockLoggerWarn).toHaveBeenCalledWith('Alert (fallback): Test Title: Test message', {
          category: 'navigation',
        });
      });

      it('logs a warning with title only when no message', () => {
        showAlertPlatform('Error');

        expect(mockLoggerWarn).toHaveBeenCalledWith('Alert (fallback): Error', {
          category: 'navigation',
        });
      });
    });

    describe('showConfirmPlatform', () => {
      it('logs a warning and returns false', async () => {
        const result = await showConfirmPlatform('Confirm', 'Are you sure?');

        expect(result).toBe(false);
        expect(mockLoggerWarn).toHaveBeenCalledWith('Confirm (fallback): Confirm: Are you sure?', {
          category: 'navigation',
        });
      });
    });
  });
});
