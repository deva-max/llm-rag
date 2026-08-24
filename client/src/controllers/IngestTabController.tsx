import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ApiCredentials, DocumentStats } from '@/types'
import { ApiOperations } from '@/operations/api.operation'
import { HttpErrorResponse } from '@/utils/errors'
import { IngestTab } from '@/views/IngestTab'

export const IngestTabController: React.FC = () => {
  const { creds } = useOutletContext<{ creds: ApiCredentials }>()
  const [activeSubTab, setActiveSubTab] = useState<'url' | 'text'>('url')
  
  const [url, setUrl] = useState('https://freeacademy.ai/lessons/memory-and-context-rag')
  const [chunkSize, setChunkSize] = useState(500)
  
  const [textTitle, setTextTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const [textSourceUrl, setTextSourceUrl] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [docStats, setDocStats] = useState<DocumentStats | null>(null)

  const loadStats = async () => {
    try {
      const stats = await ApiOperations.fetchDocuments()
      setDocStats(stats)
    } catch (e) {
      console.warn('Failed to load doc stats:', e)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleIngestUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || isLoading) return

    setIsLoading(true)
    setStatusMessage(null)

    try {
      const res = await ApiOperations.ingestUrl(url, chunkSize)
      setStatusMessage({
        type: 'success',
        text: `Successfully scraped page via Firecrawl! Title: "${res.data.title}" • Generated ${res.data.totalChunks} vector chunks.`
      })
      setUrl('')
      loadStats()
    } catch (err) {
      const message = err instanceof HttpErrorResponse ? err.message : 'Firecrawl web ingestion failed'
      setStatusMessage({
        type: 'error',
        text: message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleIngestText = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textTitle.trim() || !textContent.trim() || isLoading) return

    setIsLoading(true)
    setStatusMessage(null)

    try {
      const res = await ApiOperations.ingestText(textTitle, textContent, textSourceUrl || '', chunkSize)
      setStatusMessage({
        type: 'success',
        text: `Successfully created document: "${res.data.title}" • Generated ${res.data.totalChunks} vector chunks.`
      })
      setTextTitle('')
      setTextContent('')
      setTextSourceUrl('')
      loadStats()
    } catch (err) {
      const message = err instanceof HttpErrorResponse ? err.message : 'Text document ingestion failed'
      setStatusMessage({
        type: 'error',
        text: message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <IngestTab
      activeSubTab={activeSubTab}
      setActiveSubTab={setActiveSubTab}
      url={url}
      setUrl={setUrl}
      chunkSize={chunkSize}
      setChunkSize={setChunkSize}
      textTitle={textTitle}
      setTextTitle={setTextTitle}
      textContent={textContent}
      setTextContent={setTextContent}
      textSourceUrl={textSourceUrl}
      setTextSourceUrl={setTextSourceUrl}
      isLoading={isLoading}
      statusMessage={statusMessage}
      docStats={docStats}
      handleIngestUrl={handleIngestUrl}
      handleIngestText={handleIngestText}
    />
  )
}
