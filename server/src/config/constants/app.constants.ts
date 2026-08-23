export const APP_CONSTANTS = {
  DEFAULT_PORT: 5000,
  DEFAULT_CHUNK_SIZE: 1000,
  KAFKA: {
    BROKER: 'localhost:9092',
    CLIENT_ID: 'memory-context-rag-engine',
    TOPICS: {
      AUDIT: 'search.audit',
      INGEST: 'rag.ingest'
    }
  },
  MODELS: {
    OPENAI_DEFAULT: 'gpt-4o-mini'
  }
}
