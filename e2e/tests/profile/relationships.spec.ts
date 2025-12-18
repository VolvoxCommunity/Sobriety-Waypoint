import { test, expect } from '@playwright/test';
import { ProfilePage, EnterInviteCodeSheet } from '../../pages';

test.describe('Profile Relationships', () => {
  let profilePage: ProfilePage;
  let enterCodeSheet: EnterInviteCodeSheet;

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    enterCodeSheet = new EnterInviteCodeSheet(page);
    await profilePage.goto();
  });

  test('should display user invite code', async () => {
    await expect(profilePage.myInviteCode).toBeVisible();
    const code = await profilePage.getMyInviteCode();
    expect(code).toBeTruthy();
  });

  test('should copy invite code', async () => {
    await profilePage.copyInviteCode();
    await profilePage.expectToast('Copied');
  });

  test('should open enter invite code sheet', async () => {
    await profilePage.openEnterInviteCode();
    await expect(enterCodeSheet.inviteCodeInput).toBeVisible();
  });

  test('should show error for invalid invite code', async () => {
    await profilePage.openEnterInviteCode();
    await enterCodeSheet.enterCode('INVALID123');
    await expect(enterCodeSheet.errorMessage).toBeVisible();
  });

  test('should display relationships list', async () => {
    await expect(profilePage.relationshipsList).toBeVisible();
  });
});
