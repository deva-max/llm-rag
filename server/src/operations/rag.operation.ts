import axios from 'axios'
import { AppConfig } from '@/config'
import { ChatRequest } from '@/schemas'
import { generateEmbedding } from '@/infrastructure/embedding'
import { searchVectorStore, storeDocument } from '@/operations/db.operation'
import { fetchRelevantMemories, extractAndStoreMemories } from '@/operations/memory.operation'
import { searchWithTavily, TavilySearchResultItem } from '@/infrastructure/tavily'
import { scrapeUrlWithFirecrawl } from '@/infrastructure/firecrawl'
import { publishKafkaEvent } from '@/infrastructure/kafka'

export interface RagContextResponse {
  answer: string
  memoriesUsed: { content: string; category: string; similarity: number }[]
  vectorChunksUsed: { content: string; similarity: number; metadata?: any }[]
  tavilyResultsUsed: TavilySearchResultItem[]
  newMemoriesExtracted: { id?: string; content: string; category: string }[]
}

/**
 * Executes full RAG Pipeline: Memory Retrieval + Vector Store Retrieval + Tavily Grounding + Synthesis.
 */
export async function executeRagPipeline(
  request: ChatRequest,
  config: AppConfig
): Promise<RagContextResponse> {
  const userMessage = request.messages[request.messages.length - 1]?.content || ''
  const queryEmbedding = await generateEmbedding(userMessage, config)

  // Publish Kafka Audit Event
  publishKafkaEvent('search.audit', { query: userMessage, timestamp: new Date().toISOString() })

  // 1. Retrieve Long-Term Memories
  let memoriesUsed: { content: string; category: string; similarity: number }[] = []
  if (request.useMemory) {
    memoriesUsed = await fetchRelevantMemories(userMessage, config, 4)
  }

  // 2. Retrieve Vector Store Document Chunks
  let vectorChunksUsed: { content: string; similarity: number; metadata?: any }[] = []
  if (request.useRag) {
    vectorChunksUsed = await searchVectorStore(queryEmbedding, config, 4)
  }

  // 3. Retrieve Live Tavily Search Context
  let tavilyResultsUsed: TavilySearchResultItem[] = []
  if (request.useTavily) {
    const tavilyRes = await searchWithTavily(userMessage, config, 'basic', 3)
    tavilyResultsUsed = tavilyRes.results
  }

  // 4. Synthesize Context Prompt
  let systemContext = `You are an intelligent, empathetic RAG & Memory assistant built with React, Express, Supabase (pgvector), Firecrawl, and Tavily.`

  if (memoriesUsed.length > 0) {
    systemContext += `\n\n[USER LONG-TERM MEMORY]:\n` + memoriesUsed.map((m) => `- (${m.category}): ${m.content}`).join('\n')
  }

  if (vectorChunksUsed.length > 0) {
    systemContext += `\n\n[KNOWLEDGE BASE DOCUMENTS (RAG)]:\n` + vectorChunksUsed.map((c, i) => `[Doc Chunk ${i + 1}]: ${c.content}`).join('\n\n')
  }

  if (tavilyResultsUsed.length > 0) {
    systemContext += `\n\n[REAL-TIME TAVILY WEB SEARCH RESULTS]:\n` + tavilyResultsUsed.map((t, i) => `[Web Source ${i + 1} - ${t.title}] (${t.url}): ${t.content}`).join('\n\n')
  }

  systemContext += `\n\nInstructions: Provide a clear, helpful, accurate answer. Always reference relevant long-term memories or search/vector sources when available.`

  // 5. Generate AI Completion
  let answer = ''
  if (config.openaiApiKey && config.openaiApiKey !== 'sk-...') {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          temperature: request.temperature,
          messages: [
            { role: 'system', content: systemContext },
            ...request.messages
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${config.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      answer = response.data?.choices?.[0]?.message?.content || 'No response generated.'
    } catch (err: any) {
      console.warn('OpenAI completion failed, generating grounded fallback response:', err?.message)
      answer = generateGroundedFallbackAnswer(userMessage, memoriesUsed, vectorChunksUsed, tavilyResultsUsed)
    }
  } else {
    answer = generateGroundedFallbackAnswer(userMessage, memoriesUsed, vectorChunksUsed, tavilyResultsUsed)
  }

  // 6. Extract New Memories from User Message
  let newMemoriesExtracted: { id?: string; content: string; category: string }[] = []
  if (request.useMemory) {
    newMemoriesExtracted = await extractAndStoreMemories(userMessage, config)
  }

  return {
    answer,
    memoriesUsed,
    vectorChunksUsed,
    tavilyResultsUsed,
    newMemoriesExtracted
  }
}

/**
 * Process web ingestion via Firecrawl, split into chunks, generate embeddings, and save to vector store.
 */
export async function ingestUrl(
  url: string,
  chunkSize: number,
  config: AppConfig
) {
  const scraped = await scrapeUrlWithFirecrawl(url, config)
  const chunksText = chunkString(scraped.markdown, chunkSize)

  const chunkObjects = []
  for (let i = 0; i < chunksText.length; i++) {
    const embedding = await generateEmbedding(chunksText[i], config)
    chunkObjects.push({
      content: chunksText[i],
      embedding,
      chunkIndex: i
    })
  }

  const result = await storeDocument(scraped.title, scraped.markdown, url, chunkObjects, config)

  // Publish to Kafka
  publishKafkaEvent('rag.ingest', {
    documentId: result.id,
    title: scraped.title,
    url,
    totalChunks: result.chunkCount
  })

  return {
    documentId: result.id,
    title: scraped.title,
    url,
    totalChunks: result.chunkCount
  }
}

/**
 * Process raw text ingestion.
 */
export async function ingestText(
  title: string,
  content: string,
  sourceUrl: string | undefined,
  chunkSize: number,
  config: AppConfig
) {
  const chunksText = chunkString(content, chunkSize)

  const chunkObjects = []
  for (let i = 0; i < chunksText.length; i++) {
    const embedding = await generateEmbedding(chunksText[i], config)
    chunkObjects.push({
      content: chunksText[i],
      embedding,
      chunkIndex: i
    })
  }

  const result = await storeDocument(title, content, sourceUrl, chunkObjects, config)
  return {
    documentId: result.id,
    title,
    totalChunks: result.chunkCount
  }
}

function chunkString(str: string, size: number): string[] {
  const chunks: string[] = []
  const paragraphs = str.split(/\n\s*\n/)
  let currentChunk = ''

  for (const p of paragraphs) {
    if ((currentChunk + '\n' + p).length > size && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = p
    } else {
      currentChunk = currentChunk ? currentChunk + '\n' + p : p
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.length > 0 ? chunks : [str]
}

function generateGroundedFallbackAnswer(
  query: string,
  memories: any[],
  chunks: any[],
  tavily: TavilySearchResultItem[]
): string {
  let response = `Based on available context for your query "${query}":\n\n`

  if (memories.length > 0) {
    response += `🧠 **Recognized Long-Term Memory:**\n` + memories.map((m) => `• ${m.content}`).join('\n') + `\n\n`
  }

  if (chunks.length > 0) {
    response += `📚 **Vector Knowledge Base Context (pgvector):**\n` + chunks.map((c) => `• ${c.content.slice(0, 200)}...`).join('\n') + `\n\n`
  }

  if (tavily.length > 0) {
    response += `🌐 **Live Web Search (Tavily):**\n` + tavily.map((t) => `• [${t.title}](${t.url}): ${t.content.slice(0, 180)}...`).join('\n') + `\n\n`
  }

  if (memories.length === 0 && chunks.length === 0 && tavily.length === 0) {
    response += `I have processed your query. To enable live AI text synthesis with GPT-4, add your \`OPENAI_API_KEY\` in the Settings tab. You can also ingest web pages via Firecrawl or add documents to populate Supabase pgvector context!`
  } else {
    response += `*(Configured with local vector context fallback. Add your OpenAI API key in Settings for full GPT model completion.)*`
  }

  return response
}
