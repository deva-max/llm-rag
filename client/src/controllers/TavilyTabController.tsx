import React, { useState } from 'react'
import { ApiOperations } from '@/operations/api.operation'
import { HttpErrorResponse } from '@/utils/errors'
import { TavilyTab } from '@/views/TavilyTab'
import { TavilyResultItem } from '@/types'

export const TavilyTabController: React.FC = () => {
  const [query, setQuery] = useState('FreeAcademy memory and context RAG module')
  const [searchDepth, setSearchDepth] = useState<'basic' | 'advanced'>('basic')
  const [maxResults, setMaxResults] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<{ query: string; answer?: string; results: TavilyResultItem[] } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    setErrorMsg(null)

    try {
      const res = await ApiOperations.searchTavily(query, searchDepth, maxResults)
      setSearchResults(res)
    } catch (err) {
      const message = err instanceof HttpErrorResponse ? err.message : 'Tavily search failed'
      setErrorMsg(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TavilyTab
      query={query}
      setQuery={setQuery}
      searchDepth={searchDepth}
      setSearchDepth={setSearchDepth}
      maxResults={maxResults}
      setMaxResults={setMaxResults}
      isLoading={isLoading}
      searchResults={searchResults}
      errorMsg={errorMsg}
      handleSearch={handleSearch}
    />
  )
}
