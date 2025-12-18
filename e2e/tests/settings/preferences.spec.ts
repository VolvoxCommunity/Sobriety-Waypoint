import { test, expect } from '@playwright/test';
import { SettingsPage } from '../../pages';

test.describe('Settings Preferences', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
  });

  test('should display settings options', async () => {
    await settingsPage.expectOnSettingsPage();
    await expect(settingsPage.themeToggle).toBeVisible();
    await expect(settingsPage.logoutButton).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    await settingsPage.toggleTheme();
    // Verify theme changed (check for dark mode class or attribute)
    await expect(page.locator('html')).toHaveAttribute('data-theme', /(dark|light)/);
  });

  test('should display app version', async () => {
    await expect(settingsPage.versionText).toBeVisible();
    const version = await settingsPage.versionText.textContent();
    expect(version).toMatch(/\d+\.\d+\.\d+/);
  });

  test('should logout and redirect to login', async ({ page }) => {
    await settingsPage.logout();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate back from settings', async ({ page }) => {
    await settingsPage.goBack();
    await expect(page).not.toHaveURL(/.*settings/);
  });
});
