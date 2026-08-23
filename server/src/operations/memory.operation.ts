import axios from 'axios'
import { AppConfig } from '@/config'
import { MemoryItem, ExtractedMemoriesSchema } from '@/schemas'
import { generateEmbedding } from '@/infrastructure/embedding'
import { saveMemoryRecord, searchMemories, getAllMemories, deleteMemoryRecord } from '@/operations/db.operation'

/**
 * Analyzes conversation input and extracts long-term user memories (facts, preferences, goals).
 * Uses Zod validation for structured JSON output.
 */
export async function extractAndStoreMemories(
  userText: string,
  config: AppConfig
): Promise<MemoryItem[]> {
  const extracted: MemoryItem[] = []

  // Attempt OpenAI extraction if API Key is present
  if (config.openaiApiKey && config.openaiApiKey !== 'sk-...') {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI memory extraction agent. Extract explicit user preferences, facts, names, or goals from the user message.
Return JSON strictly matching this structure:
{
  "memories": [
    {
      "content": "User prefers TypeScript over JavaScript",
      "category": "preference",
      "confidence": 0.95
    }
  ]
}
Allowed categories: 'preference', 'fact', 'entity', 'goal', 'general'. If no clear persistent fact or preference is present, return {"memories": []}.`
            },
            {
              role: 'user',
              content: userText
            }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            Authorization: `Bearer ${config.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const rawJson = JSON.parse(response.data?.choices?.[0]?.message?.content || '{}')
      const parsed = ExtractedMemoriesSchema.safeParse(rawJson)

      if (parsed.success && parsed.data.memories.length > 0) {
        for (const item of parsed.data.memories) {
          const embedding = await generateEmbedding(item.content, config)
          const saved = await saveMemoryRecord(
            {
              content: item.content,
              category: item.category,
              confidence: item.confidence,
              source: 'chat_extraction'
            },
            embedding,
            config
          )
          extracted.push({
            id: saved.id,
            content: saved.content,
            category: saved.category as any,
            confidence: saved.confidence,
            source: saved.source,
            createdAt: saved.createdAt
          })
        }
        return extracted
      }
    } catch (err) {
      console.warn('LLM memory extraction failed, attempting fallback regex pattern:', err)
    }
  }

  // Fallback Rule-Based Memory Extraction for direct expressions ("My name is...", "I like...", "I am a...")
  const patterns = [
    { regex: /(?:my name is|i am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i, category: 'fact' as const, template: (m: string) => `User's name is ${m}` },
    { regex: /i (?:like|love|prefer|enjoy|use)\s+(.+)/i, category: 'preference' as const, template: (m: string) => `User prefers/likes: ${m}` },
    { regex: /i (?:want to|am trying to|goal is to|plan to)\s+(.+)/i, category: 'goal' as const, template: (m: string) => `User goal: ${m}` }
  ]

  for (const p of patterns) {
    const match = userText.match(p.regex)
    if (match && match[1]) {
      const memContent = p.template(match[1].trim())
      const embedding = await generateEmbedding(memContent, config)
      const saved = await saveMemoryRecord(
        {
          content: memContent,
          category: p.category,
          confidence: 0.9,
          source: 'chat_regex_fallback'
        },
        embedding,
        config
      )
      extracted.push({
        id: saved.id,
        content: saved.content,
        category: saved.category as any,
        confidence: saved.confidence,
        source: saved.source,
        createdAt: saved.createdAt
      })
    }
  }

  return extracted
}

export async function fetchRelevantMemories(
  query: string,
  config: AppConfig,
  limit = 5
) {
  const embedding = await generateEmbedding(query, config)
  return searchMemories(embedding, config, limit)
}

export async function listAllMemories(config: AppConfig) {
  return getAllMemories(config)
}

export async function removeMemory(id: string, config: AppConfig) {
  return deleteMemoryRecord(id, config)
}
