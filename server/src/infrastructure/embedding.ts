import axios from 'axios'
import { AppConfig } from '@/config'

/**
 * Generate a vector embedding for a given text string.
 * Uses OpenAI embeddings when API key is provided, or a fallback deterministic hash vector generator.
 */
export async function generateEmbedding(text: string, config: AppConfig): Promise<number[]> {
  const cleanText = text.trim()
  if (!cleanText) {
    return new Array(1536).fill(0)
  }

  if (config.openaiApiKey && config.openaiApiKey !== 'sk-...') {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: cleanText,
          model: 'text-embedding-3-small'
        },
        {
          headers: {
            Authorization: `Bearer ${config.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (response.data?.data?.[0]?.embedding) {
        return response.data.data[0].embedding
      }
    } catch (err: any) {
      console.warn('OpenAI Embedding failed, falling back to local algorithm:', err?.message || err)
    }
  }

  // Fallback 1536-dim normalized pseudo-vector calculation
  return generateDeterministicFallbackVector(cleanText, 1536)
}

/**
 * Generates a normalized 1536-dimensional fallback vector for local offline testing.
 */
function generateDeterministicFallbackVector(text: string, dimensions: number): number[] {
  const vector = new Array(dimensions).fill(0)
  const lower = text.toLowerCase()
  const words = lower.split(/\W+/).filter(Boolean)

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    let hash = 0
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j)
      hash |= 0
    }
    const idx = Math.abs(hash) % dimensions
    vector[idx] += 1 / (i + 1)
  }

  // Calculate Euclidean norm
  let norm = 0
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i]
  }
  norm = Math.sqrt(norm) || 1

  // Normalize
  for (let i = 0; i < dimensions; i++) {
    vector[i] = vector[i] / norm
  }

  return vector
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  return denominator ? dotProduct / denominator : 0
}
