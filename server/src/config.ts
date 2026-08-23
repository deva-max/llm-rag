import dotenv from 'dotenv'

dotenv.config()

export interface AppConfig {
  port: number
  supabaseUrl: string
  supabaseKey: string
  openaiApiKey: string
  firecrawlApiKey: string
  tavilyApiKey: string
}

let activeConfig: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY || '',
  tavilyApiKey: process.env.TAVILY_API_KEY || ''
}

export function getConfig(): AppConfig {
  return activeConfig
}

export function updateConfig(newConfig: Partial<AppConfig>): AppConfig {
  activeConfig = {
    ...activeConfig,
    ...newConfig
  }
  return activeConfig
}

export function getConfigFromHeaders(headers: Record<string, string | string[] | undefined>): AppConfig {
  const customSupabaseUrl = headers['x-supabase-url'] as string
  const customSupabaseKey = headers['x-supabase-key'] as string
  const customOpenaiKey = headers['x-openai-key'] as string
  const customFirecrawlKey = headers['x-firecrawl-key'] as string
  const customTavilyKey = headers['x-tavily-key'] as string

  return {
    ...activeConfig,
    supabaseUrl: customSupabaseUrl || activeConfig.supabaseUrl,
    supabaseKey: customSupabaseKey || activeConfig.supabaseKey,
    openaiApiKey: customOpenaiKey || activeConfig.openaiApiKey,
    firecrawlApiKey: customFirecrawlKey || activeConfig.firecrawlApiKey,
    tavilyApiKey: customTavilyKey || activeConfig.tavilyApiKey
  }
}
