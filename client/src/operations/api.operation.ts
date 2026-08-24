import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client'
import { Message, MemoryRecord, TavilyResultItem, DocumentStats, ConfigStatus, KafkaStatusResponse, InfisicalStatusResponse } from '@/types'

const link = new HttpLink({ uri: '/graphql' })

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

export const ApiOperations = {
  // Config & Integrations
  async fetchConfigStatus(): Promise<ConfigStatus> {
    const { data } = await apolloClient.query<any>({
      query: gql`
        query {
          configStatus {
            isSupabaseConfigured
            isOpenAiConfigured
            isFirecrawlConfigured
            isTavilyConfigured
            isInfisicalConfigured
          }
        }
      `,
      fetchPolicy: 'network-only'
    })
    return data.configStatus
  },
  
  async updateConfig(payload: any): Promise<any> {
    const { data } = await apolloClient.mutate<any>({
      mutation: gql`
        mutation UpdateConfig($input: ConfigUpdateInput!) {
          updateConfig(input: $input)
        }
      `,
      variables: { input: payload }
    })
    return { success: data.updateConfig }
  },

  async fetchKafkaStatus(): Promise<KafkaStatusResponse> {
    const { data } = await apolloClient.query<any>({
      query: gql`
        query {
          kafkaStatus {
            isConnected
            brokers
            error
          }
        }
      `,
      fetchPolicy: 'network-only'
    })
    return data.kafkaStatus
  },

  async fetchInfisicalStatus(): Promise<InfisicalStatusResponse> {
    const { data } = await apolloClient.query<any>({
      query: gql`
        query {
          infisicalStatus {
            connected
            secretsLoaded
            source
          }
        }
      `,
      fetchPolicy: 'network-only'
    })
    return data.infisicalStatus
  },

  async syncInfisical(): Promise<InfisicalStatusResponse> {
    const { data } = await apolloClient.mutate<any>({
      mutation: gql`
        mutation {
          syncInfisical
        }
      `
    })
    return { success: data.syncInfisical } as any
  },

  // RAG & Chat
  async chat(messages: { role: string; content: string }[], config: any): Promise<any> {
    const { data } = await apolloClient.mutate<any>({
      mutation: gql`
        mutation Chat($input: ChatRequestInput!) {
          chat(input: $input) {
            answer
            memoriesUsed {
              content
              category
              similarity
            }
            vectorChunksUsed {
              content
              similarity
            }
            tavilyResultsUsed {
              title
              url
              content
            }
            newMemoriesExtracted {
              content
              category
            }
          }
        }
      `,
      variables: {
        input: {
          messages,
          ...config
        }
      }
    })
    return data.chat
  },

  async ingestUrl(url: string, chunkSize: number): Promise<any> {
    const { data } = await apolloClient.mutate<any>({
      mutation: gql`
        mutation IngestUrl($url: String!, $chunkSize: Int) {
          ingestUrl(url: $url, chunkSize: $chunkSize) {
            success
            message
            data {
              documentId
              title
              url
              totalChunks
            }
          }
        }
      `,
      variables: { url, chunkSize }
    })
    return data.ingestUrl
  },

  async ingestText(title: string, content: string, sourceUrl: string, chunkSize: number): Promise<any> {
    const { data } = await apolloClient.mutate<any>({
      mutation: gql`
        mutation IngestText($title: String!, $content: String!, $sourceUrl: String, $chunkSize: Int) {
          ingestText(title: $title, content: $content, sourceUrl: $sourceUrl, chunkSize: $chunkSize) {
            success
            message
            data {
              documentId
              title
              totalChunks
            }
          }
        }
      `,
      variables: { title, content, sourceUrl, chunkSize }
    })
    return data.ingestText
  },

  async fetchDocuments(): Promise<DocumentStats> {
    const { data } = await apolloClient.query<any>({
      query: gql`
        query {
          documents {
            totalDocuments
            totalChunks
            dbSizeMB
          }
        }
      `,
      fetchPolicy: 'network-only'
    })
    return data.documents
  },

  async searchTavily(query: string, searchDepth: string, maxResults: number): Promise<{ query: string; answer?: string; results: TavilyResultItem[] }> {
    const { data } = await apolloClient.query<any>({
      query: gql`
        query SearchTavily($query: String!, $searchDepth: String, $maxResults: Int) {
          searchTavily(query: $query, searchDepth: $searchDepth, maxResults: $maxResults) {
            query
            results {
              title
              url
              content
              score
            }
          }
        }
      `,
      variables: { query, searchDepth, maxResults },
      fetchPolicy: 'network-only'
    })
    return data.searchTavily
  },

  // Memories
  async fetchMemories(): Promise<{ memories: MemoryRecord[] }> {
    const { data } = await apolloClient.query<any>({
      query: gql`
        query {
          memories {
            id
            content
            category
            confidence
            source
            createdAt
          }
        }
      `,
      fetchPolicy: 'network-only'
    })
    return { memories: data.memories }
  },

  async addMemory(content: string, category: string, confidence: number, source: string): Promise<any> {
    const { data } = await apolloClient.mutate<any>({
      mutation: gql`
        mutation AddMemory($input: MemoryItemInput!) {
          addMemory(input: $input) {
            id
            content
            category
            confidence
            source
            createdAt
          }
        }
      `,
      variables: {
        input: { content, category, confidence, source }
      }
    })
    return { success: true, memory: data.addMemory }
  },

  async deleteMemory(id: string): Promise<any> {
    const { data } = await apolloClient.mutate<any>({
      mutation: gql`
        mutation DeleteMemory($id: ID!) {
          deleteMemory(id: $id)
        }
      `,
      variables: { id }
    })
    return { success: data.deleteMemory }
  }
}
