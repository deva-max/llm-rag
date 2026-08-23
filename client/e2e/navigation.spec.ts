import { test, expect } from '@playwright/test';

test.describe('Navigation Tabs', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting URL before each test
    await page.goto('/');
  });

  test('should render the brand header correctly', async ({ page }) => {
    // Expect the header title to be visible
    await expect(page.getByRole('heading', { name: /Memory & Context RAG/i })).toBeVisible();
    await expect(page.getByText(/FreeAcademy Module/i)).toBeVisible();
  });

  test('should navigate between all tabs successfully', async ({ page }) => {
    // 1. Chat Tab (Default)
    await expect(page.locator('h3').filter({ hasText: 'RAG Context Inspector' })).toBeVisible();

    // 2. Click Ingest Tab
    await page.locator('button', { hasText: 'Firecrawl Web Crawler' }).click();
    await expect(page.locator('h2').filter({ hasText: 'Firecrawl Web Ingestion & RAG Vector Loader' })).toBeVisible();

    // 3. Click Tavily Tab
    await page.locator('button', { hasText: 'Tavily AI Search' }).click();
    await expect(page.locator('h2').filter({ hasText: 'Tavily AI Web Search Grounding Studio' })).toBeVisible();

    // 4. Click Memories Tab
    await page.locator('button', { hasText: 'Memory Explorer' }).click();
    await expect(page.locator('h2').filter({ hasText: 'Supabase Long-Term Memory Explorer' })).toBeVisible();

    // 5. Click Kafka Tab
    await page.locator('button', { hasText: 'Kafka Event Stream' }).click();
    await expect(page.locator('h2').filter({ hasText: 'Apache Kafka Event Streaming Hub' })).toBeVisible();

    // 6. Click Settings Tab
    await page.locator('button', { hasText: 'Settings & Supabase SQL' }).click();
    await expect(page.locator('h2').filter({ hasText: 'API Credentials & Supabase Configuration' })).toBeVisible();
  });
});
