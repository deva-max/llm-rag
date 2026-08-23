import { Request, Response } from 'express'
import { ConfigUpdateSchema } from '@/schemas'
import { getConfigFromHeaders, updateConfig } from '@/config'
import { isKafkaConnected, getKafkaLogs } from '@/infrastructure/kafka'
import { getInfisicalStatus, syncInfisicalSecrets } from '@/infrastructure/infisical'
import { API_MESSAGES } from '@/config/messages/api.messages'

export const getConfigStatusController = (req: Request, res: Response): void => {
  const config = getConfigFromHeaders(req.headers)
  res.json({
    supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseKey && config.supabaseUrl !== 'https://your-project.supabase.co'),
    openaiConfigured: Boolean(config.openaiApiKey && config.openaiApiKey !== 'sk-...'),
    firecrawlConfigured: Boolean(config.firecrawlApiKey && config.firecrawlApiKey !== 'fc-...'),
    tavilyConfigured: Boolean(config.tavilyApiKey && config.tavilyApiKey !== 'tvly-...')
  })
}

export const getKafkaStatusController = (req: Request, res: Response): void => {
  res.json({
    connected: isKafkaConnected(),
    logs: getKafkaLogs()
  })
}

export const getInfisicalStatusController = (req: Request, res: Response): void => {
  res.json(getInfisicalStatus())
}

export const syncInfisicalController = async (req: Request, res: Response): Promise<void> => {
  const result = await syncInfisicalSecrets()
  res.json(result)
}

export const updateConfigController = (req: Request, res: Response): void => {
  const parseResult = ConfigUpdateSchema.safeParse(req.body)
  if (!parseResult.success) {
    res.status(400).json({ error: API_MESSAGES.BAD_REQUEST, details: parseResult.error.format() })
    return
  }

  const updated = updateConfig(parseResult.data)
  res.json({
    message: 'Configuration updated successfully',
    status: {
      supabaseConfigured: Boolean(updated.supabaseUrl && updated.supabaseKey),
      openaiConfigured: Boolean(updated.openaiApiKey),
      firecrawlConfigured: Boolean(updated.firecrawlApiKey),
      tavilyConfigured: Boolean(updated.tavilyApiKey)
    }
  })
}
