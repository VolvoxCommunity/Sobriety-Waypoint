/**
 * @fileoverview Tests for SettingsSheet component
 *
 * Tests the settings bottom sheet including:
 * - Imperative API (present/dismiss via ref)
 * - Theme switching
 * - Display name editing
 * - Sign out functionality
 * - Account deletion
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsSheet, { SettingsSheetRef } from '@/components/SettingsSheet';

// =============================================================================
// Mocks
// =============================================================================

// Mock auth context
const mockSignOut = jest.fn();
const mockDeleteAccount = jest.fn();
const mockRefreshProfile = jest.fn();
const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  display_name: 'Test User',
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
    deleteAccount: mockDeleteAccount,
    profile: mockProfile,
    refreshProfile: mockRefreshProfile,
  }),
}));

// Mock theme context
const mockSetThemeMode = jest.fn();
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      primary: '#007AFF',
      primaryLight: '#E5F1FF',
      secondary: '#5856D6',
      text: '#111827',
      textSecondary: '#6b7280',
      textTertiary: '#9ca3af',
      background: '#ffffff',
      surface: '#ffffff',
      card: '#ffffff',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#dc2626',
      dangerLight: '#fee2e2',
      dangerBorder: '#fecaca',
      white: '#ffffff',
      black: '#000000',
      fontRegular: 'JetBrainsMono-Regular',
      fontMedium: 'JetBrainsMono-Medium',
      fontSemiBold: 'JetBrainsMono-SemiBold',
      fontBold: 'JetBrainsMono-Bold',
    },
    themeMode: 'light',
    setThemeMode: mockSetThemeMode,
    isDark: false,
  }),
}));

// Mock router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

// Mock supabase
const mockUpdate = jest.fn();
const mockEq = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: mockUpdate.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: null }),
      }),
    })),
  },
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  LogCategory: {
    AUTH: 'auth',
    DATABASE: 'database',
    UI: 'ui',
  },
}));

// Mock validation
jest.mock('@/lib/validation', () => ({
  validateDisplayName: jest.fn((name: string) => {
    if (!name || name.trim().length === 0) {
      return 'Display name is required';
    }
    if (name.trim().length < 2) {
      return 'Display name must be at least 2 characters';
    }
    return null;
  }),
}));

// Mock app updates hook
jest.mock('@/hooks/useAppUpdates', () => ({
  useAppUpdates: () => ({
    status: 'idle',
    isChecking: false,
    isDownloading: false,
    errorMessage: null,
    checkForUpdates: jest.fn(),
    applyUpdate: jest.fn(),
    isSupported: true,
  }),
}));

// Mock Clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

// Mock Constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

// Mock Updates
jest.mock('expo-updates', () => ({
  channel: null,
  updateId: null,
  runtimeVersion: null,
  isEmbeddedLaunch: true,
}));

// Mock Device
jest.mock('expo-device', () => ({
  modelName: 'iPhone 14 Pro',
  osName: 'iOS',
  osVersion: '17.0',
}));

// Mock Application
jest.mock('expo-application', () => ({
  nativeBuildVersion: '1',
  nativeApplicationVersion: '1.0.0',
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  LogOut: () => null,
  Moon: () => null,
  Sun: () => null,
  Monitor: () => null,
  ChevronDown: () => null,
  ChevronUp: () => null,
  Shield: () => null,
  FileText: () => null,
  Github: () => null,
  Trash2: () => null,
  AlertTriangle: () => null,
  RefreshCw: () => null,
  CheckCircle: () => null,
  Download: () => null,
  AlertCircle: () => null,
  Info: () => null,
  Copy: () => null,
  User: () => null,
  ChevronLeft: () => null,
}));

// Mock GlassBottomSheet
const mockPresent = jest.fn();
const mockDismiss = jest.fn();
jest.mock('@/components/GlassBottomSheet', () => {
  const React = require('react');
  const MockGlassBottomSheet = React.forwardRef(
    (
      { children, onDismiss }: { children: React.ReactNode; onDismiss?: () => void },
      ref: React.Ref<{ present: () => void; dismiss: () => void }>
    ) => {
      React.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: mockDismiss,
      }));
      return React.createElement('View', { testID: 'glass-bottom-sheet' }, children);
    }
  );
  MockGlassBottomSheet.displayName = 'GlassBottomSheet';
  return {
    __esModule: true,
    default: MockGlassBottomSheet,
  };
});

// Mock BottomSheetScrollView
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetScrollView: ({ children, ...props }: { children: React.ReactNode }) => {
    const React = require('react');
    const { ScrollView } = require('react-native');
    return React.createElement(
      ScrollView,
      { ...props, testID: 'bottom-sheet-scroll-view' },
      children
    );
  },
}));

// =============================================================================
// Tests
// =============================================================================

describe('SettingsSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Imperative API', () => {
    it('should expose present method via ref', () => {
      const ref = React.createRef<SettingsSheetRef>();
      render(<SettingsSheet ref={ref} />);

      expect(ref.current).toBeDefined();
      expect(ref.current?.present).toBeDefined();

      ref.current?.present();
      expect(mockPresent).toHaveBeenCalled();
    });

    it('should expose dismiss method via ref', () => {
      const ref = React.createRef<SettingsSheetRef>();
      render(<SettingsSheet ref={ref} />);

      expect(ref.current).toBeDefined();
      expect(ref.current?.dismiss).toBeDefined();

      ref.current?.dismiss();
      expect(mockDismiss).toHaveBeenCalled();
    });
  });

  describe('Rendering', () => {
    it('should render settings sections', () => {
      render(<SettingsSheet />);

      expect(screen.getByText('Account')).toBeTruthy();
      expect(screen.getByText('Appearance')).toBeTruthy();
      expect(screen.getByText('About')).toBeTruthy();
    });

    it('should display user profile information', () => {
      render(<SettingsSheet />);

      expect(screen.getByText('Display Name')).toBeTruthy();
      expect(screen.getByText('Test User')).toBeTruthy();
    });

    it('should render theme options', () => {
      render(<SettingsSheet />);

      expect(screen.getByText('Light')).toBeTruthy();
      expect(screen.getByText('Dark')).toBeTruthy();
      expect(screen.getByText('System')).toBeTruthy();
    });

    it('should render external links', () => {
      render(<SettingsSheet />);

      expect(screen.getByText('Privacy Policy')).toBeTruthy();
      expect(screen.getByText('Terms of Service')).toBeTruthy();
      expect(screen.getByText('Source Code')).toBeTruthy();
    });
  });

  describe('Theme Switching', () => {
    it('should call setThemeMode when light theme is selected', () => {
      render(<SettingsSheet />);

      const lightButton = screen.getByLabelText('Light theme');
      fireEvent.press(lightButton);

      expect(mockSetThemeMode).toHaveBeenCalledWith('light');
    });

    it('should call setThemeMode when dark theme is selected', () => {
      render(<SettingsSheet />);

      const darkButton = screen.getByLabelText('Dark theme');
      fireEvent.press(darkButton);

      expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
    });

    it('should call setThemeMode when system theme is selected', () => {
      render(<SettingsSheet />);

      const systemButton = screen.getByLabelText('System theme');
      fireEvent.press(systemButton);

      expect(mockSetThemeMode).toHaveBeenCalledWith('system');
    });
  });

  describe('Sign Out', () => {
    it('should render sign out button', () => {
      render(<SettingsSheet />);

      expect(screen.getByText('Sign Out')).toBeTruthy();
    });
  });

  describe('Danger Zone', () => {
    it('should render danger zone header', () => {
      render(<SettingsSheet />);

      expect(screen.getByText('DANGER ZONE')).toBeTruthy();
    });

    it('should toggle danger zone expansion', () => {
      render(<SettingsSheet />);

      const dangerZoneHeader = screen.getByLabelText('Danger Zone section');
      fireEvent.press(dangerZoneHeader);

      // After toggle, delete account button should be visible
      expect(screen.getByText('Delete Account')).toBeTruthy();
    });
  });

  describe('Build Info', () => {
    it('should render build info header', () => {
      render(<SettingsSheet />);

      expect(screen.getByText('BUILD INFO')).toBeTruthy();
    });

    it('should toggle build info expansion', () => {
      render(<SettingsSheet />);

      const buildInfoHeader = screen.getByLabelText('Build Information section');
      fireEvent.press(buildInfoHeader);

      // After toggle, build info details should be visible
      expect(screen.getByText('App Version')).toBeTruthy();
    });
  });
});
