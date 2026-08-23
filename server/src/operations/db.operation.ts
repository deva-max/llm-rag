import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { AppConfig } from '@/config'
import { MemoryItem } from '@/schemas'
import { cosineSimilarity } from '@/infrastructure/embedding'

export interface DocumentRecord {
  id: string
  title: string
  sourceUrl?: string
  content: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface ChunkRecord {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  embedding: number[]
  metadata?: Record<string, any>
  createdAt: string
}

export interface MemoryRecord {
  id: string
  content: string
  category: string
  confidence: number
  embedding?: number[]
  source: string
  createdAt: string
}

// In-Memory Fallback Storage
class InMemoryStore {
  documents: Map<string, DocumentRecord> = new Map()
  chunks: ChunkRecord[] = []
  memories: MemoryRecord[] = []

  saveDocument(doc: DocumentRecord) {
    this.documents.set(doc.id, doc)
  }

  saveChunks(chunks: ChunkRecord[]) {
    this.chunks.push(...chunks)
  }

  saveMemory(mem: MemoryRecord) {
    this.memories.push(mem)
  }

  getMemories(): MemoryRecord[] {
    return this.memories
  }

  deleteMemory(id: string): boolean {
    const initialLen = this.memories.length
    this.memories = this.memories.filter((m) => m.id !== id)
    return this.memories.length < initialLen
  }

  matchChunks(queryEmbedding: number[], threshold = 0.1, limit = 5) {
    return this.chunks
      .map((c) => ({
        ...c,
        similarity: cosineSimilarity(queryEmbedding, c.embedding)
      }))
      .filter((c) => c.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }

  matchMemories(queryEmbedding: number[], threshold = 0.1, limit = 5) {
    return this.memories
      .filter((m) => m.embedding && m.embedding.length > 0)
      .map((m) => ({
        ...m,
        similarity: cosineSimilarity(queryEmbedding, m.embedding!)
      }))
      .filter((m) => m.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }
}

const memoryStore = new InMemoryStore()

function getSupabaseClient(config: AppConfig): SupabaseClient | null {
  if (
    config.supabaseUrl &&
    config.supabaseKey &&
    config.supabaseUrl !== 'https://your-project.supabase.co' &&
    config.supabaseKey !== 'your-supabase-anon-or-service-key'
  ) {
    try {
      return createClient(config.supabaseUrl, config.supabaseKey)
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e)
    }
  }
  return null
}

export async function storeDocument(
  title: string,
  content: string,
  sourceUrl: string | undefined,
  chunks: { content: string; embedding: number[]; chunkIndex: number }[],
  config: AppConfig
): Promise<{ id: string; chunkCount: number }> {
  const supabase = getSupabaseClient(config)
  const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const now = new Date().toISOString()

  if (supabase) {
    try {
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert([{ title, content, source_url: sourceUrl, metadata: { sourceUrl } }])
        .select()
        .single()

      if (docError) throw docError

      const chunkRows = chunks.map((c) => ({
        document_id: doc.id,
        content: c.content,
        chunk_index: c.chunkIndex,
        embedding: c.embedding,
        metadata: { sourceUrl }
      }))

      const { error: chunkError } = await supabase.from('document_chunks').insert(chunkRows)
      if (chunkError) throw chunkError

      return { id: doc.id, chunkCount: chunks.length }
    } catch (err: any) {
      console.warn('Supabase store failed, storing in memory:', err?.message || err)
    }
  }

  // Fallback Store
  memoryStore.saveDocument({
    id: docId,
    title,
    content,
    sourceUrl,
    createdAt: now
  })

  memoryStore.saveChunks(
    chunks.map((c, i) => ({
      id: `chunk_${docId}_${i}`,
      documentId: docId,
      content: c.content,
      chunkIndex: c.chunkIndex,
      embedding: c.embedding,
      createdAt: now
    }))
  )

  return { id: docId, chunkCount: chunks.length }
}

export async function searchVectorStore(
  queryEmbedding: number[],
  config: AppConfig,
  limit = 5
): Promise<{ content: string; similarity: number; metadata?: any }[]> {
  const supabase = getSupabaseClient(config)

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.1,
        match_count: limit
      })

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          content: item.content,
          similarity: item.similarity,
          metadata: item.metadata
        }))
      }
    } catch (err) {
      console.warn('Supabase match_document_chunks RPC failed/unavailable, trying fallback:', err)
    }
  }

  return memoryStore.matchChunks(queryEmbedding, 0.05, limit).map((c) => ({
    content: c.content,
    similarity: c.similarity,
    metadata: c.metadata
  }))
}

export async function saveMemoryRecord(
  memory: MemoryItem,
  embedding: number[],
  config: AppConfig
): Promise<MemoryRecord> {
  const supabase = getSupabaseClient(config)
  const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const now = new Date().toISOString()

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .insert([
          {
            content: memory.content,
            category: memory.category,
            confidence: memory.confidence,
            source: memory.source,
            embedding
          }
        ])
        .select()
        .single()

      if (!error && data) {
        return {
          id: data.id,
          content: data.content,
          category: data.category,
          confidence: data.confidence,
          source: data.source,
          createdAt: data.created_at
        }
      }
    } catch (err) {
      console.warn('Supabase save memory failed, falling back to memory:', err)
    }
  }

  const rec: MemoryRecord = {
    id,
    content: memory.content,
    category: memory.category,
    confidence: memory.confidence,
    source: memory.source,
    embedding,
    createdAt: now
  }
  memoryStore.saveMemory(rec)
  return rec
}

export async function getAllMemories(config: AppConfig): Promise<MemoryRecord[]> {
  const supabase = getSupabaseClient(config)
  if (supabase) {
    try {
      const { data, error } = await supabase.from('memories').select('*').order('created_at', { ascending: false })
      if (!error && data) {
        return data.map((m) => ({
          id: m.id,
          content: m.content,
          category: m.category,
          confidence: m.confidence,
          source: m.source,
          createdAt: m.created_at
        }))
      }
    } catch (e) {
      console.warn('Failed to fetch memories from Supabase:', e)
    }
  }
  return memoryStore.getMemories()
}

export async function deleteMemoryRecord(id: string, config: AppConfig): Promise<boolean> {
  const supabase = getSupabaseClient(config)
  if (supabase) {
    try {
      const { error } = await supabase.from('memories').delete().eq('id', id)
      if (!error) return true
    } catch (e) {
      console.warn('Failed to delete memory from Supabase:', e)
    }
  }
  return memoryStore.deleteMemory(id)
}

export async function searchMemories(
  queryEmbedding: number[],
  config: AppConfig,
  limit = 5
): Promise<{ content: string; category: string; similarity: number }[]> {
  const supabase = getSupabaseClient(config)
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('match_memories', {
        query_embedding: queryEmbedding,
        match_threshold: 0.1,
        match_count: limit
      })
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((m: any) => ({
          content: m.content,
          category: m.category,
          similarity: m.similarity
        }))
      }
    } catch (e) {
      console.warn('Supabase match_memories RPC failed/unavailable:', e)
    }
  }

  return memoryStore.matchMemories(queryEmbedding, 0.05, limit).map((m) => ({
    content: m.content,
    category: m.category,
    similarity: m.similarity
  }))
}

export async function getDocumentStats(config: AppConfig) {
  const supabase = getSupabaseClient(config)
  if (supabase) {
    try {
      const { data: docs } = await supabase.from('documents').select('id, title, source_url, created_at')
      const { count: chunkCount } = await supabase.from('document_chunks').select('*', { count: 'exact', head: true })
      return {
        totalDocuments: docs?.length || 0,
        totalChunks: chunkCount || 0,
        documents: docs || []
      }
    } catch (e) {
      console.warn('Failed to fetch doc stats from Supabase:', e)
    }
  }
  return {
    totalDocuments: memoryStore.documents.size,
    totalChunks: memoryStore.chunks.length,
    documents: Array.from(memoryStore.documents.values())
  }
}
