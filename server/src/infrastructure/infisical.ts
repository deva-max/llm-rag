import { InfisicalSDK } from '@infisical/sdk'
import { AppConfig, updateConfig } from '@/config'

export interface InfisicalStatus {
  connected: boolean
  secretsLoaded: number
  source: 'infisical_vault' | 'environment_fallback'
}

let isInfisicalConnected = false
let loadedCount = 0

/**
 * Syncs secrets from Infisical Vault if token is provided.
 */
export async function syncInfisicalSecrets(): Promise<InfisicalStatus> {
  const serviceToken = process.env.INFISICAL_SERVICE_TOKEN || process.env.INFISICAL_TOKEN
  const siteUrl = process.env.INFISICAL_SITE_URL || 'http://localhost:8080'

  if (!serviceToken) {
    return {
      connected: false,
      secretsLoaded: 0,
      source: 'environment_fallback'
    }
  }

  try {
    const infisicalClient = new InfisicalSDK({
      siteUrl
    })

    await infisicalClient.auth().universalAuth.login({
      clientId: process.env.INFISICAL_CLIENT_ID || '',
      clientSecret: process.env.INFISICAL_CLIENT_SECRET || ''
    })

    const secrets = await infisicalClient.secrets().listSecrets({
      environment: process.env.INFISICAL_ENV || 'dev',
      projectId: process.env.INFISICAL_PROJECT_ID || ''
    })

    if (secrets && secrets.secrets) {
      const updates: Partial<AppConfig> = {}
      for (const s of secrets.secrets) {
        if (s.secretKey === 'SUPABASE_URL') updates.supabaseUrl = s.secretValue
        if (s.secretKey === 'SUPABASE_KEY') updates.supabaseKey = s.secretValue
        if (s.secretKey === 'OPENAI_API_KEY') updates.openaiApiKey = s.secretValue
        if (s.secretKey === 'FIRECRAWL_API_KEY') updates.firecrawlApiKey = s.secretValue
        if (s.secretKey === 'TAVILY_API_KEY') updates.tavilyApiKey = s.secretValue
      }

      updateConfig(updates)
      isInfisicalConnected = true
      loadedCount = secrets.secrets.length
      console.log(`✅ Loaded ${loadedCount} secrets from Infisical Vault`)
      return {
        connected: true,
        secretsLoaded: loadedCount,
        source: 'infisical_vault'
      }
    }
  } catch (err: any) {
    console.warn(`[Infisical] Vault sync unavailable (${err?.message || err}). Using process environment fallback.`)
  }

  return {
    connected: false,
    secretsLoaded: 0,
    source: 'environment_fallback'
  }
}

export function getInfisicalStatus(): InfisicalStatus {
  return {
    connected: isInfisicalConnected,
    secretsLoaded: loadedCount,
    source: isInfisicalConnected ? 'infisical_vault' : 'environment_fallback'
  }
}
