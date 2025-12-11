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
