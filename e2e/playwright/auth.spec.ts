import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('NeuroCashEngine')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('立即注册').click();
    await expect(page.getByText('已有账号？')).toBeVisible();
  });
});