import { getConfigFromHeaders, updateConfig } from '@/config'
import { isKafkaConnected, getKafkaLogs } from '@/infrastructure/kafka'
import { getInfisicalStatus, syncInfisicalSecrets } from '@/infrastructure/infisical'
import { executeRagPipeline, ingestUrl, ingestText } from '@/operations/rag.operation'
import { listAllMemories, removeMemory } from '@/operations/memory.operation'
import { saveMemoryRecord, getDocumentStats } from '@/operations/db.operation'
import { searchWithTavily } from '@/infrastructure/tavily'
import { generateEmbedding } from '@/infrastructure/embedding'

export const resolvers = {
  Query: {
    memories: async (_: any, __: any, context: any) => {
      const config = getConfigFromHeaders(context.req.headers)
      const memories = await listAllMemories(config)
      return memories
    },
    documents: async (_: any, __: any, context: any) => {
      const config = getConfigFromHeaders(context.req.headers)
      return await getDocumentStats(config)
    },
    configStatus: (_: any, __: any, context: any) => {
      const config = getConfigFromHeaders(context.req.headers)
      return {
        isSupabaseConfigured: Boolean(config.supabaseUrl && config.supabaseKey && config.supabaseUrl !== 'https://your-project.supabase.co'),
        isOpenAiConfigured: Boolean(config.openaiApiKey && config.openaiApiKey !== 'sk-...'),
        isFirecrawlConfigured: Boolean(config.firecrawlApiKey && config.firecrawlApiKey !== 'fc-...'),
        isTavilyConfigured: Boolean(config.tavilyApiKey && config.tavilyApiKey !== 'tvly-...'),
        isInfisicalConfigured: Boolean(getInfisicalStatus().connected)
      }
    },
    kafkaStatus: () => {
      return {
        isConnected: isKafkaConnected(),
        brokers: [],
        error: getKafkaLogs().join('\\n')
      }
    },
    infisicalStatus: () => {
      return getInfisicalStatus()
    },
    searchTavily: async (_: any, { query, searchDepth, maxResults }: any, context: any) => {
      const config = getConfigFromHeaders(context.req.headers)
      return await searchWithTavily(query, config, searchDepth || 'basic', maxResults || 5)
    }
  },
  Mutation: {
    chat: async (_: any, { input }: any, context: any) => {
      const config = getConfigFromHeaders(context.req.headers)
      return await executeRagPipeline(input, config)
    },
    ingestUrl: async (_: any, { url, crawlSubpages, maxDepth, chunkSize }: any, context: any) => {
      const config = getConfigFromHeaders(context.req.headers)
      const result = await ingestUrl(url, chunkSize || 500, config)
      return {
        success: true,
        message: 'Ingest successful',
        data: result
      }
    },
    ingestText: async (_: any, { title, content, sourceUrl, chunkSize }: any, context: any) => {
      const config = getConfigFromHeaders(context.req.headers)
      const result = await ingestText(title, content, sourceUrl, chunkSize || 500, config)
      return {
        success: true,
        message: 'Ingest successful',
        data: result
      }
    },
    addMemory: async (_: any, { input }: any, context: any) => {
      const config = getConfigFromHeaders(context.req.headers)
      const embedding = await generateEmbedding(input.content, config)
      const saved = await saveMemoryRecord(input, embedding, config)
      return saved
    },
    deleteMemory: async (_: any, { id }: any, context: any) => {
      const config = getConfigFromHeaders(context.req.headers)
      return await removeMemory(id, config)
    },
    syncInfisical: async () => {
      const result = await syncInfisicalSecrets()
      return result.connected
    },
    updateConfig: (_: any, { input }: any) => {
      updateConfig(input)
      return true
    }
  }
}
