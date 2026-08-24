import { gql } from 'graphql-tag'

export const typeDefs = gql`
  enum MessageRole {
    user
    assistant
    system
  }

  type ChatMessage {
    role: MessageRole!
    content: String!
  }

  input ChatMessageInput {
    role: MessageRole!
    content: String!
  }

  input ChatRequestInput {
    messages: [ChatMessageInput!]!
    useRag: Boolean
    useTavily: Boolean
    useMemory: Boolean
    temperature: Float
  }

  enum MemoryCategory {
    preference
    fact
    entity
    goal
    general
  }

  type MemoryItem {
    id: ID
    content: String!
    category: MemoryCategory!
    confidence: Float!
    source: String!
    createdAt: String
  }

  input MemoryItemInput {
    id: ID
    content: String!
    category: MemoryCategory
    confidence: Float
    source: String
    createdAt: String
  }

  type IngestResult {
    success: Boolean!
    message: String!
    data: IngestData
  }

  type IngestData {
    documentId: String
    title: String
    url: String
    totalChunks: Int
  }

  type TavilySearchResult {
    query: String!
    results: [TavilyResultItem!]!
  }

  type TavilyResultItem {
    title: String!
    url: String!
    content: String!
    score: Float
  }

  type DocumentStats {
    totalDocuments: Int!
    totalChunks: Int!
    dbSizeMB: Float!
  }

  type ConfigStatus {
    isSupabaseConfigured: Boolean!
    isOpenAiConfigured: Boolean!
    isFirecrawlConfigured: Boolean!
    isTavilyConfigured: Boolean!
    isInfisicalConfigured: Boolean!
  }

  type KafkaStatus {
    isConnected: Boolean!
    brokers: [String!]
    error: String
  }

  type InfisicalStatus {
    connected: Boolean!
    secretsLoaded: Int!
    source: String!
  }

  input ConfigUpdateInput {
    supabaseUrl: String
    supabaseKey: String
    openaiApiKey: String
    firecrawlApiKey: String
    tavilyApiKey: String
  }

  type Query {
    memories: [MemoryItem!]!
    documents: DocumentStats!
    configStatus: ConfigStatus!
    kafkaStatus: KafkaStatus!
    infisicalStatus: InfisicalStatus!
    searchTavily(query: String!, searchDepth: String, maxResults: Int): TavilySearchResult!
  }

  type Mutation {
    chat(input: ChatRequestInput!): ChatResponse!
    ingestUrl(url: String!, crawlSubpages: Boolean, maxDepth: Int, chunkSize: Int): IngestResult!
    ingestText(title: String!, content: String!, sourceUrl: String, chunkSize: Int): IngestResult!
    addMemory(input: MemoryItemInput!): MemoryItem!
    deleteMemory(id: ID!): Boolean!
    syncInfisical: Boolean!
    updateConfig(input: ConfigUpdateInput!): Boolean!
  }

  type ChatResponse {
    answer: String!
    memoriesUsed: [MemoryContext!]!
    vectorChunksUsed: [VectorChunkContext!]!
    tavilyResultsUsed: [TavilyResultItem!]!
    newMemoriesExtracted: [NewMemoryContext!]!
  }

  type MemoryContext {
    content: String!
    category: String!
    similarity: Float!
  }

  type VectorChunkContext {
    content: String!
    similarity: Float!
  }

  type NewMemoryContext {
    id: String
    content: String!
    category: String!
  }
`
