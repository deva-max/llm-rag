import { Router } from 'express'
import {
  chatController,
  ingestUrlController,
  ingestTextController,
  searchTavilyController
} from '@/controllers/rag.controller'
import {
  getMemoriesController,
  addMemoryController,
  deleteMemoryController,
  getStatsController
} from '@/controllers/memory.controller'
import {
  getConfigStatusController,
  getKafkaStatusController,
  getInfisicalStatusController,
  syncInfisicalController,
  updateConfigController
} from '@/controllers/config.controller'

const router = Router()

// 1. Chat RAG Endpoint
router.post('/chat', chatController)

// 2. Ingest URL (Firecrawl)
router.post('/ingest/url', ingestUrlController)

// 3. Ingest Text
router.post('/ingest/text', ingestTextController)

// 4. Direct Tavily Web Search
router.post('/search/tavily', searchTavilyController)

// 5. Memory Management Endpoints
router.get('/memories', getMemoriesController)
router.post('/memories', addMemoryController)
router.delete('/memories/:id', deleteMemoryController)

// 6. Documents & Vector Stats
router.get('/documents', getStatsController)

// 7. Config & Integrations Management
router.get('/config/status', getConfigStatusController)
router.get('/kafka/status', getKafkaStatusController)
router.get('/infisical/status', getInfisicalStatusController)
router.post('/infisical/sync', syncInfisicalController)
router.post('/config', updateConfigController)

export default router

