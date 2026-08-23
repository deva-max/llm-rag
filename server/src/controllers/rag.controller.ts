import { Request, Response } from 'express'
import {
  ChatRequestSchema,
  IngestUrlRequestSchema,
  IngestTextRequestSchema,
  TavilySearchRequestSchema
} from '@/schemas'
import { getConfigFromHeaders } from '@/config'
import { executeRagPipeline, ingestUrl, ingestText } from '@/operations/rag.operation'
import { searchWithTavily } from '@/infrastructure/tavily'
import { API_MESSAGES, RAG_MESSAGES } from '@/config/messages/api.messages'

export const chatController = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = ChatRequestSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({ error: API_MESSAGES.BAD_REQUEST, details: parseResult.error.format() })
      return
    }

    const config = getConfigFromHeaders(req.headers)
    const ragResult = await executeRagPipeline(parseResult.data, config)
    res.json(ragResult)
  } catch (error: any) {
    console.error('Chat endpoint error:', error)
    res.status(500).json({ error: error.message || API_MESSAGES.SERVER_ERROR })
  }
}

export const ingestUrlController = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = IngestUrlRequestSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({ error: API_MESSAGES.BAD_REQUEST, details: parseResult.error.format() })
      return
    }

    const config = getConfigFromHeaders(req.headers)
    const { url, chunkSize } = parseResult.data
    const result = await ingestUrl(url, chunkSize, config)

    res.json({
      success: true,
      message: RAG_MESSAGES.INGEST_SUCCESS,
      data: result
    })
  } catch (error: any) {
    console.error('Ingest URL error:', error)
    res.status(500).json({ error: error.message || 'Failed to ingest URL' })
  }
}

export const ingestTextController = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = IngestTextRequestSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({ error: API_MESSAGES.BAD_REQUEST, details: parseResult.error.format() })
      return
    }

    const config = getConfigFromHeaders(req.headers)
    const { title, content, sourceUrl, chunkSize } = parseResult.data
    const result = await ingestText(title, content, sourceUrl, chunkSize, config)

    res.json({
      success: true,
      message: RAG_MESSAGES.INGEST_SUCCESS,
      data: result
    })
  } catch (error: any) {
    console.error('Ingest Text error:', error)
    res.status(500).json({ error: error.message || 'Failed to ingest text' })
  }
}

export const searchTavilyController = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = TavilySearchRequestSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({ error: API_MESSAGES.BAD_REQUEST, details: parseResult.error.format() })
      return
    }

    const config = getConfigFromHeaders(req.headers)
    const { query, searchDepth, maxResults } = parseResult.data
    const searchRes = await searchWithTavily(query, config, searchDepth, maxResults)

    res.json(searchRes)
  } catch (error: any) {
    console.error('Tavily search error:', error)
    res.status(500).json({ error: error.message || 'Failed to execute Tavily search' })
  }
}
