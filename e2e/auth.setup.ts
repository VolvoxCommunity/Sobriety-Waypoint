import { test as setup, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-data';
import { resetTestData, ensureTestUserExists } from './utils/supabase-helpers';

const authFile = 'e2e/.auth/primary-state.json';

setup('authenticate', async ({ page }) => {
  // Ensure test user exists in Supabase Auth
  await ensureTestUserExists(
    TEST_USERS.primary.id,
    TEST_USERS.primary.email,
    TEST_USERS.primary.password
  );

  // Reset test data before running tests
  await resetTestData();

  // Navigate to login page and wait for network to settle
  // This prevents race conditions with React hydration that can detach form elements
  await page.goto('/login', { waitUntil: 'networkidle' });

  // Wait for the email input to be stable (attached, visible, and enabled)
  // This gives React time to complete hydration before we interact with the form
  const emailInput = page.getByTestId('login-email-input');
  await emailInput.waitFor({ state: 'attached', timeout: 10000 });

  // Fill login form
  await emailInput.fill(TEST_USERS.primary.email);
  await page.getByTestId('login-password-input').fill(TEST_USERS.primary.password);
  await page.getByTestId('login-submit-button').click();

  // Wait for redirect to home page
  // Add a longer timeout to ensure the authentication state is updated
  await expect(page).toHaveURL(/.*\/(app)?$/, { timeout: 10000 });

  // Save storage state
  await page.context().storageState({ path: authFile });
});
