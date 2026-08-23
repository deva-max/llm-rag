import { z } from 'zod'

// Chat & Message Schemas
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system'])

export const ChatMessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string().min(1, 'Message content cannot be empty')
})

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  useRag: z.boolean().default(true),
  useTavily: z.boolean().default(true),
  useMemory: z.boolean().default(true),
  temperature: z.number().min(0).max(2).default(0.7)
})

// Memory Schemas
export const MemoryCategorySchema = z.enum(['preference', 'fact', 'entity', 'goal', 'general'])

export const MemoryItemSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1, 'Memory content is required'),
  category: MemoryCategorySchema.default('general'),
  confidence: z.number().min(0).max(1).default(1.0),
  source: z.string().default('chat_extraction'),
  createdAt: z.string().optional()
})

export const ExtractedMemoriesSchema = z.object({
  memories: z.array(z.object({
    content: z.string(),
    category: MemoryCategorySchema,
    confidence: z.number().min(0).max(1)
  }))
})

// Ingestion & Firecrawl Schemas
export const IngestUrlRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  crawlSubpages: z.boolean().default(false),
  maxDepth: z.number().min(1).max(3).default(1),
  chunkSize: z.number().min(100).max(4000).default(500)
})

export const IngestTextRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  sourceUrl: z.string().url().optional(),
  chunkSize: z.number().min(100).max(4000).default(500)
})

// Tavily Web Search Schema
export const TavilySearchRequestSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  searchDepth: z.enum(['basic', 'advanced']).default('basic'),
  maxResults: z.number().min(1).max(10).default(5)
})

// Configuration Schema
export const ConfigUpdateSchema = z.object({
  supabaseUrl: z.string().optional(),
  supabaseKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  firecrawlApiKey: z.string().optional(),
  tavilyApiKey: z.string().optional()
})

export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type ChatRequest = z.infer<typeof ChatRequestSchema>
export type MemoryItem = z.infer<typeof MemoryItemSchema>
export type ExtractedMemories = z.infer<typeof ExtractedMemoriesSchema>
export type IngestUrlRequest = z.infer<typeof IngestUrlRequestSchema>
export type IngestTextRequest = z.infer<typeof IngestTextRequestSchema>
export type TavilySearchRequest = z.infer<typeof TavilySearchRequestSchema>
export type ConfigUpdate = z.infer<typeof ConfigUpdateSchema>
