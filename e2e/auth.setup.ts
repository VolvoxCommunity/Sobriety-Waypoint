import { test as setup, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-data';
import { resetTestData } from './utils/supabase-helpers';

const authFile = 'e2e/.auth/primary-state.json';

setup('authenticate', async ({ page }) => {
  // Reset test data before running tests
  await resetTestData();

  // Navigate to login page
  await page.goto('/login');

  // Fill login form
  await page.getByTestId('login-email-input').fill(TEST_USERS.primary.email);
  await page.getByTestId('login-password-input').fill(TEST_USERS.primary.password);
  await page.getByTestId('login-submit-button').click();

  // Wait for redirect to home page
  await expect(page).toHaveURL(/.*\/(app)?$/);

  // Save storage state
  await page.context().storageState({ path: authFile });
});
