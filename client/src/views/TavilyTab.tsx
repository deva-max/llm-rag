import React, { useState } from 'react'
import { ApiCredentials, TavilyResultItem } from '@/types'
import { ApiOperations } from '@/operations/api.operation'
import { HttpErrorResponse } from '@/utils/errors'
import { Search, Globe, Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react'

export const TavilyTab: React.FC = () => {
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search color="var(--accent-emerald)" />
          Tavily AI Web Search Grounding Studio
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Execute real-time web search tuned for LLMs and RAG agents via **Tavily**. Retrieves search content, citations, and AI syntheses for fresh web facts.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              className="glass-input"
              style={{ flex: 1 }}
              placeholder="Search query for live web grounding..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <button className="btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? <Sparkles className="animate-spin" size={16} /> : <Zap size={16} />}
              {isLoading ? 'Searching Tavily...' : 'Execute AI Search'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Search Depth:</span>
              <select
                className="glass-input"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                value={searchDepth}
                onChange={(e) => setSearchDepth(e.target.value as any)}
              >
                <option value="basic">Basic (Fast)</option>
                <option value="advanced">Advanced (Deep Crawl)</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Max Results:</span>
              <select
                className="glass-input"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
              >
                <option value={3}>3 Results</option>
                <option value={5}>5 Results</option>
                <option value={8}>8 Results</option>
              </select>
            </label>
          </div>
        </form>
      </div>

      {errorMsg && (
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '13px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Results View */}
      {searchResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* AI Search Synthesized Answer */}
          {searchResults.answer && (
            <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-emerald)' }}>
              <h3 style={{ fontSize: '14px', color: '#6ee7b7', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> Tavily AI Synthesized Summary
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                {searchResults.answer}
              </p>
            </div>
          )}

          {/* Individual Search Results */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {searchResults.results.map((item, idx) => (
              <div key={idx} className="glass-card animate-fade-in" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '14px', fontWeight: '700', color: '#67e8f9', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {item.title} <ExternalLink size={12} />
                    </a>
                    <span className="badge badge-emerald">{(item.score * 100).toFixed(0)}% Score</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                    {item.content}
                  </p>
                </div>
                <div style={{ marginTop: '12px', fontSize: '10px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.url}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  )
}
