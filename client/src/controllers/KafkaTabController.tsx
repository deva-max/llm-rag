import React, { useState, useEffect } from 'react'
import { KafkaStatusResponse } from '@/types'
import { ApiOperations } from '@/operations/api.operation'
import { HttpErrorResponse } from '@/utils/errors'
import { KafkaTab } from '@/views/KafkaTab'

export const KafkaTabController: React.FC = () => {
  const [kafkaStatus, setKafkaStatus] = useState<KafkaStatusResponse | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadStatus = async () => {
    setIsRefreshing(true)
    try {
      const data = await ApiOperations.fetchKafkaStatus()
      setKafkaStatus(data)
    } catch (e) {
      console.warn('Failed to load Kafka status:', e instanceof HttpErrorResponse ? e.message : e)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <KafkaTab
      kafkaStatus={kafkaStatus}
      isRefreshing={isRefreshing}
      loadStatus={loadStatus}
    />
  )
}
