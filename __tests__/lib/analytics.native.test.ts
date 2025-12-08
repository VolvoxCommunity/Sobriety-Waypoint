// Mock @react-native-firebase/analytics before imports
import analytics from '@react-native-firebase/analytics';
import {
  initializeNativeAnalytics,
  trackEventNative,
  setUserIdNative,
  setUserPropertiesNative,
  trackScreenViewNative,
  resetAnalyticsNative,
} from '@/lib/analytics.native';

jest.mock('@react-native-firebase/analytics', () => {
  const mockAnalytics = {
    logEvent: jest.fn(() => Promise.resolve()),
    setUserId: jest.fn(() => Promise.resolve()),
    setUserProperties: jest.fn(() => Promise.resolve()),
    logScreenView: jest.fn(() => Promise.resolve()),
    resetAnalyticsData: jest.fn(() => Promise.resolve()),
    setAnalyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
  };
  return {
    __esModule: true,
    default: jest.fn(() => mockAnalytics),
  };
});

describe('Native Analytics', () => {
  const mockAnalyticsInstance = analytics();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeNativeAnalytics', () => {
    it('completes without error', async () => {
      await expect(initializeNativeAnalytics()).resolves.not.toThrow();
    });
  });

  describe('trackEventNative', () => {
    it('calls logEvent with event name and params', async () => {
      await trackEventNative('test_event', { param1: 'value1' });

      expect(mockAnalyticsInstance.logEvent).toHaveBeenCalledWith('test_event', {
        param1: 'value1',
      });
    });

    it('calls logEvent without params when none provided', async () => {
      await trackEventNative('test_event');

      expect(mockAnalyticsInstance.logEvent).toHaveBeenCalledWith('test_event', undefined);
    });
  });

  describe('setUserIdNative', () => {
    it('sets user ID', async () => {
      await setUserIdNative('user-123');

      expect(mockAnalyticsInstance.setUserId).toHaveBeenCalledWith('user-123');
    });

    it('clears user ID when null', async () => {
      await setUserIdNative(null);

      expect(mockAnalyticsInstance.setUserId).toHaveBeenCalledWith(null);
    });
  });

  describe('setUserPropertiesNative', () => {
    it('sets user properties', async () => {
      const props = { theme_preference: 'dark' };
      await setUserPropertiesNative(props);

      expect(mockAnalyticsInstance.setUserProperties).toHaveBeenCalledWith(props);
    });
  });

  describe('trackScreenViewNative', () => {
    it('logs screen view with name', async () => {
      await trackScreenViewNative('HomeScreen');

      expect(mockAnalyticsInstance.logScreenView).toHaveBeenCalledWith({
        screen_name: 'HomeScreen',
        screen_class: 'HomeScreen',
      });
    });

    it('logs screen view with name and class', async () => {
      await trackScreenViewNative('HomeScreen', 'TabScreen');

      expect(mockAnalyticsInstance.logScreenView).toHaveBeenCalledWith({
        screen_name: 'HomeScreen',
        screen_class: 'TabScreen',
      });
    });
  });

  describe('resetAnalyticsNative', () => {
    it('resets analytics data', async () => {
      await resetAnalyticsNative();

      expect(mockAnalyticsInstance.resetAnalyticsData).toHaveBeenCalled();
    });
  });
});
