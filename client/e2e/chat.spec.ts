import { test, expect } from '@playwright/test';

test.describe('Chat Tab Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and ensure we are on Chat tab (default)
    await page.goto('/');
  });

  test('should render welcome message and initial layout', async ({ page }) => {
    // Verify the assistant welcome message exists (note: it contains literal markdown asterisks)
    await expect(page.getByText('Hello! I am your **Memory & Context RAG Engine**', { exact: false })).toBeVisible();

    // Verify input box exists and is enabled
    const input = page.getByPlaceholder(/Type your message or tell me a preference/i);
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Verify Send button exists
    const sendButton = page.locator('button', { hasText: 'Send' });
    await expect(sendButton).toBeVisible();
  });

  test('should toggle RAG controls', async ({ page }) => {
    // Look for the checkboxes in the toolbar
    const memoryToggle = page.locator('label').filter({ hasText: 'Memory Recall' }).locator('input');
    const ragToggle = page.locator('label').filter({ hasText: 'pgvector RAG' }).locator('input');
    const tavilyToggle = page.locator('label').filter({ hasText: 'Tavily Grounding' }).locator('input');

    // Default states are true in ChatTab
    await expect(memoryToggle).toBeChecked();
    await expect(ragToggle).toBeChecked();
    await expect(tavilyToggle).toBeChecked();

    // Toggle them off
    await memoryToggle.uncheck();
    await expect(memoryToggle).not.toBeChecked();

    await ragToggle.uncheck();
    await expect(ragToggle).not.toBeChecked();
  });
});
