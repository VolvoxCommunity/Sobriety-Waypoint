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
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    await settingsPage.toggleTheme();

    const newTheme = await html.getAttribute('data-theme');

    // Verify theme actually changed to the opposite value
    expect(newTheme).not.toBe(initialTheme);
    if (initialTheme === 'dark') {
      expect(newTheme).toBe('light');
    } else if (initialTheme === 'light') {
      expect(newTheme).toBe('dark');
    }
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
