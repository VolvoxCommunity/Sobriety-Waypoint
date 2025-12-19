export const TEST_USERS = {
  primary: {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'e2e-primary@sobers-test.com',
    password: process.env.E2E_TEST_PASSWORD || 'test-password-change-me',
    displayName: 'E2E Primary User',
    sobrietyDate: '2024-01-15',
  },
  sponsor: {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'e2e-sponsor@sobers-test.com',
    password: process.env.E2E_TEST_PASSWORD || 'test-password-change-me',
    displayName: 'E2E Sponsor User',
    sobrietyDate: '2020-06-01',
  },
  sponsee: {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'e2e-sponsee@sobers-test.com',
    password: process.env.E2E_TEST_PASSWORD || 'test-password-change-me',
    displayName: 'E2E Sponsee User',
    sobrietyDate: '2024-10-01',
  },
  onboarding: {
    email: 'e2e-onboarding@sobers-test.com',
    password: process.env.E2E_TEST_PASSWORD || 'test-password-change-me',
  },
} as const;

export const TEST_INVITE_CODES = {
  sponsor: 'SPONSOR123',
} as const;

export const TEST_TASKS = {
  daily: {
    id: 'task-1111-1111-1111-111111111111',
  },
} as const;

export function generateSignupEmail(): string {
  return `e2e-signup-${Date.now()}@sobers-test.com`;
}
