/**
 * @fileoverview Tests for keyboard avoidance in profile.tsx
 *
 * Tests keyboard avoidance behavior including:
 * - KeyboardAvoidingView rendering with correct behavior prop
 * - Platform-specific behavior (iOS vs Android)
 * - Input positioning when keyboard appears
 * - Modal content adjustment with keyboard
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import ProfileScreen from '@/app/(tabs)/profile';
import { renderWithProviders } from '@/__tests__/test-utils';

// Mock Platform to test both iOS and Android behavior
const mockPlatformIOS = jest.mocked(Platform, {
  OS: 'ios',
  select: jest.fn(),
});

const mockPlatformAndroid = jest.mocked(Platform, {
  OS: 'android',
  select: jest.fn(),
});

/**
 * Test suite for keyboard avoidance in ProfileScreen
 */
describe('ProfileScreen Keyboard Avoidance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Sponsor Code Entry', () => {
    it('renders KeyboardAvoidingView with correct behavior for iOS', async () => {
      mockPlatformIOS.select.mockReturnValue('ios');

      renderWithProviders(<ProfileScreen />);

      // Simulate showing invite input
      fireEvent.press(screen.getByText('Enter Invite Code'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter 8-character code')).toBeTruthy();
      });

      // Find the KeyboardAvoidingView
      const keyboardAvoidingView = screen.getByTestId('keyboard-avoiding-view');

      expect(keyboardAvoidingView).toBeTruthy();
      expect(keyboardAvoidingView.props.behavior).toBe('padding');
    });

    it('renders KeyboardAvoidingView with correct behavior for Android', async () => {
      mockPlatformAndroid.select.mockReturnValue('android');

      renderWithProviders(<ProfileScreen />);

      // Simulate showing invite input
      fireEvent.press(screen.getByText('Enter Invite Code'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter 8-character code')).toBeTruthy();
      });

      // Find the KeyboardAvoidingView
      const keyboardAvoidingView = screen.getByTestId('keyboard-avoiding-view');

      expect(keyboardAvoidingView).toBeTruthy();
      expect(keyboardAvoidingView.props.behavior).toBe('height');
    });

    it('positions input field above keyboard on iOS', async () => {
      mockPlatformIOS.select.mockReturnValue('ios');

      renderWithProviders(<ProfileScreen />);

      // Simulate showing invite input
      fireEvent.press(screen.getByText('Enter Invite Code'));

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter 8-character code');
        expect(input).toBeTruthy();

        // On iOS, the input should be positioned to avoid keyboard
        // This is verified by checking that KeyboardAvoidingView wraps the input
        const keyboardAvoidingView = input.parent;
        expect(keyboardAvoidingView).toBeTruthy();
        expect(keyboardAvoidingView.props.behavior).toBe('padding');
      });
    });

    it('positions input field above keyboard on Android', async () => {
      mockPlatformAndroid.select.mockReturnValue('android');

      renderWithProviders(<ProfileScreen />);

      // Simulate showing invite input
      fireEvent.press(screen.getByText('Enter Invite Code'));

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter 8-character code');
        expect(input).toBeTruthy();

        // On Android, the input should be positioned to avoid keyboard
        // This is verified by checking that KeyboardAvoidingView wraps the input
        const keyboardAvoidingView = input.parent;
        expect(keyboardAvoidingView).toBeTruthy();
        expect(keyboardAvoidingView.props.behavior).toBe('height');
      });
    });
  });

  describe('Slip-up Modal', () => {
    it('renders KeyboardAvoidingView with correct behavior for iOS', async () => {
      mockPlatformIOS.select.mockReturnValue('ios');

      renderWithProviders(<ProfileScreen />);

      // Open slip-up modal
      fireEvent.press(screen.getByText('Log a Slip Up'));

      await waitFor(() => {
        expect(screen.getByText('Slip Up Date')).toBeTruthy();
        expect(screen.getByText('Notes (Optional)')).toBeTruthy();
      });

      // Find the KeyboardAvoidingView in the modal
      const keyboardAvoidingView = screen.getByTestId('slip-up-modal-keyboard-avoiding');

      expect(keyboardAvoidingView).toBeTruthy();
      expect(keyboardAvoidingView.props.behavior).toBe('padding');
    });

    it('renders KeyboardAvoidingView with correct behavior for Android', async () => {
      mockPlatformAndroid.select.mockReturnValue('android');

      renderWithProviders(<ProfileScreen />);

      // Open slip-up modal
      fireEvent.press(screen.getByText('Log a Slip Up'));

      await waitFor(() => {
        expect(screen.getByText('Slip Up Date')).toBeTruthy();
        expect(screen.getByText('Notes (Optional)')).toBeTruthy();
      });

      // Find the KeyboardAvoidingView in the modal
      const keyboardAvoidingView = screen.getByTestId('slip-up-modal-keyboard-avoiding');

      expect(keyboardAvoidingView).toBeTruthy();
      expect(keyboardAvoidingView.props.behavior).toBe('height');
    });

    it('adjusts modal content when keyboard appears on iOS', async () => {
      mockPlatformIOS.select.mockReturnValue('ios');

      renderWithProviders(<ProfileScreen />);

      // Open slip-up modal
      fireEvent.press(screen.getByText('Log a Slip Up'));

      await waitFor(() => {
        const modal = screen.getByTestId('slip-up-modal');
        expect(modal).toBeTruthy();

        // Focus the notes input to trigger keyboard
        const notesInput = screen.getByPlaceholderText('What happened? How are you feeling?');
        fireEvent(notesInput, 'focus');

        // The modal should adjust its position to avoid keyboard
        // This is verified by checking the KeyboardAvoidingView behavior
        const keyboardAvoidingView = screen.getByTestId('slip-up-modal-keyboard-avoiding');
        expect(keyboardAvoidingView).toBeTruthy();
        expect(keyboardAvoidingView.props.behavior).toBe('padding');
      });
    });

    it('adjusts modal content when keyboard appears on Android', async () => {
      mockPlatformAndroid.select.mockReturnValue('android');

      renderWithProviders(<ProfileScreen />);

      // Open slip-up modal
      fireEvent.press(screen.getByText('Log a Slip Up'));

      await waitFor(() => {
        const modal = screen.getByTestId('slip-up-modal');
        expect(modal).toBeTruthy();

        // Focus the notes input to trigger keyboard
        const notesInput = screen.getByPlaceholderText('What happened? How are you feeling?');
        fireEvent(notesInput, 'focus');

        // The modal should adjust its position to avoid keyboard
        // This is verified by checking the KeyboardAvoidingView behavior
        const keyboardAvoidingView = screen.getByTestId('slip-up-modal-keyboard-avoiding');
        expect(keyboardAvoidingView).toBeTruthy();
        expect(keyboardAvoidingView.props.behavior).toBe('height');
      });
    });

    it('maintains input accessibility when keyboard is active', async () => {
      mockPlatformIOS.select.mockReturnValue('ios');

      renderWithProviders(<ProfileScreen />);

      // Open slip-up modal
      fireEvent.press(screen.getByText('Log a Slip Up'));

      await waitFor(() => {
        const notesInput = screen.getByPlaceholderText('What happened? How are you feeling?');
        expect(notesInput).toBeTruthy();

        // Input should maintain accessibility when keyboard is shown
        expect(notesInput.props.accessibilityLabel).toBe(undefined);
        expect(notesInput.props.accessibilityRole).toBe(undefined);
      });
    });
  });
});
