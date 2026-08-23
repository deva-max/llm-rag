import { Message, MemoryRecord, TavilyResultItem, DocumentStats, ConfigStatus, KafkaStatusResponse, InfisicalStatusResponse } from '@/types'
import { APP_CONSTANTS } from '@/config/constants/app.constants'
import { HttpErrorResponse } from '@/utils/errors'

const BASE = APP_CONSTANTS.API_BASE_URL

async function handleResponse(res: Response) {
  if (!res.ok) {
    let msg = 'API Error'
    let data
    try {
      data = await res.json()
      msg = data.error || data.message || msg
    } catch (e) {}
    throw new HttpErrorResponse(msg, res.status, data)
  }
  return res.json()
}

export const ApiOperations = {
  // Config & Integrations
  async fetchConfigStatus(): Promise<ConfigStatus> {
    const res = await fetch(`${BASE}/config/status`)
    return handleResponse(res)
  },
  async updateConfig(payload: any): Promise<any> {
    const res = await fetch(`${BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return handleResponse(res)
  },
  async fetchKafkaStatus(): Promise<KafkaStatusResponse> {
    const res = await fetch(`${BASE}/kafka/status`)
    return handleResponse(res)
  },
  async fetchInfisicalStatus(): Promise<InfisicalStatusResponse> {
    const res = await fetch(`${BASE}/infisical/status`)
    return handleResponse(res)
  },
  async syncInfisical(): Promise<InfisicalStatusResponse> {
    const res = await fetch(`${BASE}/infisical/sync`, { method: 'POST' })
    return handleResponse(res)
  },

  // RAG & Chat
  async chat(messages: { role: string; content: string }[], config: any): Promise<any> {
    const res = await fetch(`${BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...config, messages })
    })
    return handleResponse(res)
  },
  async ingestUrl(url: string, chunkSize: number): Promise<any> {
    const res = await fetch(`${BASE}/ingest/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, chunkSize })
    })
    return handleResponse(res)
  },
  async ingestText(title: string, content: string, sourceUrl: string, chunkSize: number): Promise<any> {
    const res = await fetch(`${BASE}/ingest/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, sourceUrl, chunkSize })
    })
    return handleResponse(res)
  },
  async fetchDocuments(): Promise<DocumentStats> {
    const res = await fetch(`${BASE}/documents`)
    return handleResponse(res)
  },
  async searchTavily(query: string, searchDepth: string, maxResults: number): Promise<{ query: string; answer?: string; results: TavilyResultItem[] }> {
    const res = await fetch(`${BASE}/search/tavily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, searchDepth, maxResults })
    })
    return handleResponse(res)
  },

  // Memories
  async fetchMemories(): Promise<{ memories: MemoryRecord[] }> {
    const res = await fetch(`${BASE}/memories`)
    return handleResponse(res)
  },
  async addMemory(content: string, category: string, confidence: number, source: string): Promise<any> {
    const res = await fetch(`${BASE}/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, category, confidence, source })
    })
    return handleResponse(res)
  },
  async deleteMemory(id: string): Promise<any> {
    const res = await fetch(`${BASE}/memories/${id}`, { method: 'DELETE' })
    return handleResponse(res)
  }
}
