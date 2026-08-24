import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { ApolloServer } from '@apollo/server'
// @ts-ignore
import { expressMiddleware } from '@as-integrations/express4'
import { typeDefs } from '@/graphql/typeDefs'
import { resolvers } from '@/graphql/resolvers'
import { getConfig } from '@/config'
import { initKafka } from '@/infrastructure/kafka'
import { syncInfisicalSecrets } from '@/infrastructure/infisical'
import { errorHandler } from '@/middleware/error.middleware'
import { clientFallbackMiddleware } from '@/middleware/static.middleware'

dotenv.config()

async function startServer() {
  const app = express()
  const config = getConfig()

  // 1. Standard Middleware
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))

  // 2. Setup Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  })

  await apolloServer.start()

  // 3. Register GraphQL Route
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }: any) => ({ req }),
    })
  )

  // 4. Serve production client build (fallback)
  app.use(clientFallbackMiddleware())

  // 5. API Error Handling (Catch-all)
  app.use(errorHandler)

  const PORT = config.port

  app.listen(PORT, async () => {
    console.log(`\n🚀 RAG & Memory Express Server running on http://localhost:${PORT}`)
    console.log(`📡 GraphQL API available at http://localhost:${PORT}/graphql`)

    // Sync Infisical Secrets
    await syncInfisicalSecrets()

    // Initialize Apache Kafka Producer/Consumer
    await initKafka()
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
})
