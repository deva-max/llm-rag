export type TabType = 'chat' | 'ingest' | 'tavily' | 'memories' | 'kafka' | 'settings'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  ragContext?: {
    memoriesUsed: { content: string; category: string; similarity: number }[]
    vectorChunksUsed: { content: string; similarity: number; metadata?: any }[]
    tavilyResultsUsed: { title: string; url: string; content: string; score: number }[]
    newMemoriesExtracted: { id?: string; content: string; category: string }[]
  }
}

export interface MemoryRecord {
  id: string
  content: string
  category: 'preference' | 'fact' | 'entity' | 'goal' | 'general'
  confidence: number
  source: string
  createdAt: string
}

export interface TavilyResultItem {
  title: string
  url: string
  content: string
  score: number
}

export interface DocumentStats {
  totalDocuments: number
  totalChunks: number
  documents: { id: string; title: string; source_url?: string; created_at: string }[]
}

export interface ConfigStatus {
  supabaseConfigured: boolean
  openaiConfigured: boolean
  firecrawlConfigured: boolean
  tavilyConfigured: boolean
}

export interface KafkaLog {
  id: string
  topic: string
  payload: any
  timestamp: string
  status: 'published' | 'processed' | 'fallback'
}

export interface KafkaStatusResponse {
  connected: boolean
  logs: KafkaLog[]
}

export interface InfisicalStatusResponse {
  connected: boolean
  secretsLoaded: number
  source: 'infisical_vault' | 'environment_fallback'
}

export interface ApiCredentials {
  supabaseUrl: string
  supabaseKey: string
  openaiApiKey: string
  firecrawlApiKey: string
  tavilyApiKey: string
}
