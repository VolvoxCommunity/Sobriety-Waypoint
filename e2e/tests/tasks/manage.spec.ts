import { test, expect } from '@playwright/test';
import { ManageTasksPage } from '../../pages';

test.describe('Manage Tasks', () => {
  let manageTasksPage: ManageTasksPage;

  test.beforeEach(async ({ page }) => {
    manageTasksPage = new ManageTasksPage(page);
    await manageTasksPage.goto();
  });

  test('should display tasks list', async () => {
    await expect(manageTasksPage.tasksList).toBeVisible();
  });

  test('should show create task button', async () => {
    await expect(manageTasksPage.createTaskButton).toBeVisible();
  });

  test('should create a new task', async () => {
    await manageTasksPage.createTask('E2E Test Task', 'Task created during E2E testing', 'daily');
    await manageTasksPage.expectToast('Task created');
  });

  test('should open task edit form', async () => {
    await manageTasksPage.editTask('task-1111-1111-1111-111111111111');
    await expect(manageTasksPage.taskTitleInput).toBeVisible();
  });

  test('should cancel task creation', async () => {
    await manageTasksPage.createTaskButton.click();
    await manageTasksPage.cancelButton.click();
    await expect(manageTasksPage.taskTitleInput).not.toBeVisible();
  });
});
