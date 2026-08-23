import { test, expect } from '@playwright/test';

test.describe('Settings Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Settings & Supabase SQL' }).click();
  });

  test('should render credentials form properly', async ({ page }) => {
    await expect(page.getByText('API Credentials & Supabase Configuration')).toBeVisible();

    // Verify inputs exist
    const supabaseUrlInput = page.getByPlaceholder('https://your-project.supabase.co');
    await expect(supabaseUrlInput).toBeVisible();

    const openaiKeyInput = page.getByPlaceholder('sk-...');
    await expect(openaiKeyInput).toBeVisible();

    // Test filling a form value
    await openaiKeyInput.fill('sk-mock-key-for-testing');
    await expect(openaiKeyInput).toHaveValue('sk-mock-key-for-testing');
  });

  test('should display SQL copy functionality', async ({ page }) => {
    const copyButton = page.locator('button', { hasText: 'Copy SQL Script' });
    await expect(copyButton).toBeVisible();
    
    // Check if the script pre tag renders
    await expect(page.locator('pre')).toContainText('CREATE EXTENSION IF NOT EXISTS vector');
  });
});
