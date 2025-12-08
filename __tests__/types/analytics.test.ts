// __tests__/types/analytics.test.ts
import type {
  EventParams,
  UserProperties,
  AnalyticsConfig,
  DaysSoberBucket,
} from '@/types/analytics';

describe('Analytics Types', () => {
  describe('EventParams', () => {
    it('accepts valid event parameters', () => {
      const params: EventParams = {
        task_id: '123',
        days_to_complete: 3,
        is_first_task: true,
        optional_field: undefined,
      };
      expect(params.task_id).toBe('123');
      expect(params.days_to_complete).toBe(3);
      expect(params.is_first_task).toBe(true);
    });
  });

  describe('UserProperties', () => {
    it('accepts valid user properties', () => {
      const props: UserProperties = {
        days_sober_bucket: '31-90',
        has_sponsor: true,
        has_sponsees: false,
        theme_preference: 'dark',
        sign_in_method: 'google',
      };
      expect(props.days_sober_bucket).toBe('31-90');
      expect(props.sign_in_method).toBe('google');
    });

    it('allows partial user properties', () => {
      const props: UserProperties = {
        theme_preference: 'system',
      };
      expect(props.theme_preference).toBe('system');
      expect(props.has_sponsor).toBeUndefined();
    });
  });

  describe('DaysSoberBucket', () => {
    it('defines all expected bucket ranges', () => {
      const buckets: DaysSoberBucket[] = ['0-7', '8-30', '31-90', '91-180', '181-365', '365+'];
      expect(buckets).toHaveLength(6);
    });
  });

  describe('AnalyticsConfig', () => {
    it('accepts web configuration', () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-api-key',
        projectId: 'test-project',
        appId: 'test-app-id',
        measurementId: 'G-XXXXXXXX',
      };
      expect(config.measurementId).toBe('G-XXXXXXXX');
    });
  });
});
