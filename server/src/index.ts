import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRouter from '@/routes/api'
import { getConfig } from '@/config'
import { initKafka } from '@/infrastructure/kafka'
import { syncInfisicalSecrets } from '@/infrastructure/infisical'
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware'
import { clientFallbackMiddleware } from '@/middleware/static.middleware'

dotenv.config()

const app = express()
const config = getConfig()

// 1. Standard Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// 2. Register API Routes
app.use('/api', apiRouter)

// 3. Serve production client build (fallback)
app.use(clientFallbackMiddleware())

// 4. API Error Handling (Catch-all)
app.use('/api', notFoundHandler)
app.use(errorHandler)

const PORT = config.port

app.listen(PORT, async () => {
  console.log(`\n🚀 RAG & Memory Express Server running on http://localhost:${PORT}`)
  console.log(`📡 API available at http://localhost:${PORT}/api`)

  // Sync Infisical Secrets
  await syncInfisicalSecrets()

  // Initialize Apache Kafka Producer/Consumer
  await initKafka()
})
