import { test, expect } from '@playwright/test';
import { TasksPage } from '../../pages';

test.describe('Tasks View', () => {
  let tasksPage: TasksPage;

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page);
    await tasksPage.goto();
  });

  test('should display tasks list', async () => {
    await tasksPage.expectOnTasksPage();
    const taskCount = await tasksPage.getTaskCount();
    expect(taskCount).toBeGreaterThan(0);
  });

  test('should filter tasks by frequency', async () => {
    await tasksPage.filterByFrequency('daily');
    // Verify filter is applied
    await expect(tasksPage.filterDaily).toHaveAttribute('data-selected', 'true');
  });

  test('should complete a task', async () => {
    await tasksPage.completeTask('task-1111-1111-1111-111111111111');
    await tasksPage.expectToast('Task completed');
  });

  test('should show add task button', async () => {
    await expect(tasksPage.addTaskButton).toBeVisible();
  });
});
