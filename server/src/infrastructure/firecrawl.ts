import axios from 'axios'
import { AppConfig } from '@/config'

export interface FirecrawlScrapeResult {
  title: string
  markdown: string
  url: string
  metadata?: Record<string, any>
}

/**
 * Scrapes a single URL or crawls subpages using Firecrawl API.
 * Includes graceful HTTP fallback parser when Firecrawl key is absent.
 */
export async function scrapeUrlWithFirecrawl(
  url: string,
  config: AppConfig
): Promise<FirecrawlScrapeResult> {
  const apiKey = config.firecrawlApiKey

  if (apiKey && apiKey !== 'fc-...') {
    try {
      const response = await axios.post(
        'https://api.firecrawl.dev/v1/scrape',
        {
          url,
          formats: ['markdown'],
          onlyMainContent: true
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      )

      if (response.data?.success && response.data?.data) {
        const data = response.data.data
        return {
          title: data.metadata?.title || extractDomainAsTitle(url),
          markdown: data.markdown || data.content || '',
          url: data.metadata?.sourceURL || url,
          metadata: data.metadata
        }
      }
    } catch (err: any) {
      console.warn('Firecrawl API scrape failed, attempting fallback HTTP fetch:', err?.response?.data || err?.message)
    }
  }

  // Fallback Scraper: Simple HTTP fetch with regex text cleanup
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MemoryContextRAG/1.0'
      },
      timeout: 10000
    })

    const html = res.data || ''
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : extractDomainAsTitle(url)
    
    // Strip scripts, styles, tags to extract text
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return {
      title: `${title} (HTTP Extracted)`,
      markdown: cleanText || `Scraped content from ${url}`,
      url
    }
  } catch (err: any) {
    throw new Error(`Failed to scrape ${url}: ${err.message || 'Network error'}`)
  }
}

function extractDomainAsTitle(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname + parsed.pathname
  } catch (e) {
    return url
  }
}
