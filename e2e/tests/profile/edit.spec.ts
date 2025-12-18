import { test, expect } from '@playwright/test';
import { ProfilePage, EditDisplayNameSheet } from '../../pages';

test.describe('Profile Edit', () => {
  let profilePage: ProfilePage;
  let editSheet: EditDisplayNameSheet;

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    editSheet = new EditDisplayNameSheet(page);
    await profilePage.goto();
  });

  test('should open edit display name sheet', async () => {
    await profilePage.openEditDisplayName();
    await expect(editSheet.displayNameInput).toBeVisible();
  });

  test('should update display name', async () => {
    await profilePage.openEditDisplayName();
    await editSheet.updateDisplayName('Updated E2E User');
    await profilePage.expectToast('Name updated');

    const newName = await profilePage.getDisplayName();
    expect(newName).toBe('Updated E2E User');
  });

  test('should open log slip-up sheet', async ({ page }) => {
    await profilePage.openLogSlipUp();
    await expect(page.getByTestId('log-slip-up-confirm-button')).toBeVisible();
  });
});
