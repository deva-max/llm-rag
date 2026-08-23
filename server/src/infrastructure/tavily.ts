import axios from 'axios'
import { AppConfig } from '@/config'

export interface TavilySearchResultItem {
  title: string
  url: string
  content: string
  score: number
}

export interface TavilySearchResponse {
  query: string
  results: TavilySearchResultItem[]
  answer?: string
}

/**
 * Searches the web using Tavily AI Search API for RAG web grounding.
 */
export async function searchWithTavily(
  query: string,
  config: AppConfig,
  searchDepth: 'basic' | 'advanced' = 'basic',
  maxResults = 5
): Promise<TavilySearchResponse> {
  const apiKey = config.tavilyApiKey

  if (apiKey && apiKey !== 'tvly-...') {
    try {
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: apiKey,
          query,
          search_depth: searchDepth,
          include_answer: true,
          include_raw_content: false,
          max_results: maxResults
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      )

      if (response.data) {
        return {
          query: response.data.query || query,
          answer: response.data.answer,
          results: (response.data.results || []).map((r: any) => ({
            title: r.title,
            url: r.url,
            content: r.content,
            score: r.score || 0.9
          }))
        }
      }
    } catch (err: any) {
      console.warn('Tavily API search failed:', err?.response?.data || err?.message)
    }
  }

  // Demo Fallback Search Results
  return {
    query,
    answer: `Demo search results for query: "${query}". Configure TAVILY_API_KEY for live Tavily web search.`,
    results: [
      {
        title: `FreeAcademy.ai - Memory and Context RAG Module`,
        url: `https://freeacademy.ai/lessons/memory-and-context-rag`,
        content: `RAG architectures rely on vector databases like Supabase (pgvector), short-term conversation context, and long-term user memory extraction to construct high-precision prompts.`,
        score: 0.98
      },
      {
        title: `Supabase Vector & pgvector Documentation`,
        url: `https://supabase.com/docs/guides/database/extensions/pgvector`,
        content: `Supabase enables storing high-dimensional vectors and querying similarity via cosine distance using HNSW and IVFFlat indexes in Postgres.`,
        score: 0.92
      }
    ]
  }
}
