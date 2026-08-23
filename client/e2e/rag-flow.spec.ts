import { test, expect } from '@playwright/test';

test.describe('Full RAG Pipeline Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Chat Tab
    await page.goto('/');
  });

  test('should simulate LLM query, return mock Supabase response, and update RAG Context Inspector', async ({ page }) => {
    // Intercept the chat API request to mock the backend Supabase/LLM logic
    await page.route('**/api/chat', async (route) => {
      // Mock the JSON response formatted exactly as ApiOperations.chat expects
      const mockResponse = {
        answer: "Supabase pgvector enables blazing-fast similarity search directly inside your Postgres database. This allows for scalable RAG applications.",
        memoriesUsed: [
          { content: "User previously asked about Supabase vector indexing.", similarity: 0.95, category: "technical_preference" }
        ],
        vectorChunksUsed: [
          { content: "pgvector is a PostgreSQL extension for vector similarity search. It can be used for building AI applications.", similarity: 0.92 },
          { content: "Supabase provides managed pgvector natively in its database offerings.", similarity: 0.88 }
        ],
        tavilyResultsUsed: [],
        newMemoriesExtracted: []
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    // 1. Locate the input and type the query
    const input = page.getByPlaceholder(/Type your message or tell me a preference/i);
    await expect(input).toBeVisible();
    await input.fill("What is Supabase pgvector?");

    // 2. Submit the query
    const sendButton = page.locator('button', { hasText: 'Send' });
    await sendButton.click();

    // 3. Assert the user message appeared in the feed
    await expect(page.getByText("What is Supabase pgvector?", { exact: true })).toBeVisible();

    // 4. Assert the simulated LLM answer appears
    await expect(page.getByText("Supabase pgvector enables blazing-fast similarity search", { exact: false })).toBeVisible();

    // 5. Assert the Context Badges appear below the assistant message
    const memoriesBadge = page.locator('span.badge-indigo', { hasText: '1 Memories Recalled' });
    const vectorsBadge = page.locator('span.badge-cyan', { hasText: '2 Vector Chunks' });
    
    await expect(memoriesBadge).toBeVisible();
    await expect(vectorsBadge).toBeVisible();

    // 6. Test interactivity: Click the vector badge to load into the Inspector
    await vectorsBadge.click();

    // 7. Assert that the RAG Context Inspector side panel populated the vector chunks
    const inspectorPanel = page.locator('.glass-card', { hasText: 'RAG Context Inspector' });
    
    await expect(inspectorPanel.getByText('Vector Chunks (2)')).toBeVisible();
    
    // Check that the mocked chunk text is rendered in the inspector
    await expect(inspectorPanel.getByText('pgvector is a PostgreSQL extension for vector similarity search', { exact: false })).toBeVisible();
    await expect(inspectorPanel.getByText('User previously asked about Supabase vector indexing', { exact: false })).toBeVisible();
  });
});
