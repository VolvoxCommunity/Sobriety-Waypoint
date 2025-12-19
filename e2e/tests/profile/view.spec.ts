import { test, expect } from '@playwright/test';
import { ProfilePage } from '../../pages';
import { TEST_USERS } from '../../fixtures/test-data';

test.describe('Profile View', () => {
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    await profilePage.goto();
  });

  test('should display profile information', async () => {
    await profilePage.expectOnProfilePage();
    const displayName = await profilePage.getDisplayName();
    expect(displayName).toBe(TEST_USERS.primary.displayName);
  });

  test('should display sobriety stats', async () => {
    await expect(profilePage.sobrietyStats).toBeVisible();
    const daysSober = await profilePage.getDaysSober();
    expect(daysSober).toBeGreaterThan(0);
  });

  test('should display invite code sections', async () => {
    // Sponsor section (Generate Invite Code)
    await expect(profilePage.sponsorInviteCodeSection).toBeVisible();
    // Sponsee section (Enter Invite Code)
    await expect(profilePage.sponseeInviteCodeSection).toBeVisible();
  });

  test('should navigate to settings', async ({ page }) => {
    await profilePage.openSettings();
    await expect(page).toHaveURL(/.*settings/);
  });
});
