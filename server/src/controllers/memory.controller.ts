import { Request, Response } from 'express'
import { MemoryItemSchema } from '@/schemas'
import { getConfigFromHeaders } from '@/config'
import { listAllMemories, removeMemory } from '@/operations/memory.operation'
import { saveMemoryRecord, getDocumentStats } from '@/operations/db.operation'
import { generateEmbedding } from '@/infrastructure/embedding'
import { API_MESSAGES } from '@/config/messages/api.messages'

export const getMemoriesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = getConfigFromHeaders(req.headers)
    const memories = await listAllMemories(config)
    res.json({ memories })
  } catch (error: any) {
    res.status(500).json({ error: error.message || API_MESSAGES.SERVER_ERROR })
  }
}

export const addMemoryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = MemoryItemSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({ error: API_MESSAGES.BAD_REQUEST, details: parseResult.error.format() })
      return
    }

    const config = getConfigFromHeaders(req.headers)
    const embedding = await generateEmbedding(parseResult.data.content, config)
    const saved = await saveMemoryRecord(parseResult.data, embedding, config)

    res.json({ success: true, memory: saved })
  } catch (error: any) {
    res.status(500).json({ error: error.message || API_MESSAGES.SERVER_ERROR })
  }
}

export const deleteMemoryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = getConfigFromHeaders(req.headers)
    const memoryId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string)
    const success = await removeMemory(memoryId, config)
    res.json({ success })
  } catch (error: any) {
    res.status(500).json({ error: error.message || API_MESSAGES.SERVER_ERROR })
  }
}

export const getStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = getConfigFromHeaders(req.headers)
    const stats = await getDocumentStats(config)
    res.json(stats)
  } catch (error: any) {
    res.status(500).json({ error: error.message || API_MESSAGES.SERVER_ERROR })
  }
}
