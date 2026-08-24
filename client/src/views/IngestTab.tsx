import React from 'react'
import { DocumentStats } from '@/types'
import { Globe, FileText, Database, Sparkles, CheckCircle2, ArrowRight, Layers, AlertCircle, Loader2 } from 'lucide-react'

interface IngestTabProps {
  activeSubTab: 'url' | 'text'
  setActiveSubTab: (val: 'url' | 'text') => void
  url: string
  setUrl: (val: string) => void
  chunkSize: number
  setChunkSize: (val: number) => void
  textTitle: string
  setTextTitle: (val: string) => void
  textContent: string
  setTextContent: (val: string) => void
  textSourceUrl: string
  setTextSourceUrl: (val: string) => void
  isLoading: boolean
  statusMessage: { type: 'success' | 'error'; text: string } | null
  docStats: DocumentStats | null
  handleIngestUrl: (e: React.FormEvent) => void
  handleIngestText: (e: React.FormEvent) => void
}

export const IngestTab: React.FC<IngestTabProps> = ({
  activeSubTab,
  setActiveSubTab,
  url,
  setUrl,
  chunkSize,
  setChunkSize,
  textTitle,
  setTextTitle,
  textContent,
  setTextContent,
  textSourceUrl,
  setTextSourceUrl,
  isLoading,
  statusMessage,
  docStats,
  handleIngestUrl,
  handleIngestText
}) => {

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe color="var(--accent-cyan)" />
            Firecrawl Web Ingestion & RAG Vector Loader
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Scrape clean markdown content from any website using **Firecrawl**, split into semantic chunks, generate 1536-dim embeddings, and index into **Supabase pgvector**.
          </p>
        </div>

        {/* Quick Stats Widget */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: 'rgba(13, 21, 39, 0.8)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#67e8f9' }}>{docStats?.totalDocuments || 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Documents</div>
          </div>
          <div style={{ background: 'rgba(13, 21, 39, 0.8)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#a5b4fc' }}>{docStats?.totalChunks || 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vector Chunks</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        
        {/* Ingestion Form Panel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          
          {/* Sub-Tab Selector */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <button
              onClick={() => setActiveSubTab('url')}
              style={{
                background: activeSubTab === 'url' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                border: activeSubTab === 'url' ? '1px solid rgba(6, 182, 212, 0.4)' : 'none',
                color: activeSubTab === 'url' ? '#67e8f9' : 'var(--text-muted)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Globe size={16} /> Firecrawl URL Scrape
            </button>
            <button
              onClick={() => setActiveSubTab('text')}
              style={{
                background: activeSubTab === 'text' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: activeSubTab === 'text' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
                color: activeSubTab === 'text' ? '#a5b4fc' : 'var(--text-muted)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FileText size={16} /> Raw Document Text
            </button>
          </div>

          {/* Form Feedback */}
          {statusMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: statusMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: statusMessage.type === 'success' ? '#6ee7b7' : '#fca5a5',
              fontSize: '13px'
            }}>
              {statusMessage.text}
            </div>
          )}

          {activeSubTab === 'url' ? (
            <form onSubmit={handleIngestUrl} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                  Target Web Page URL to Scrape (Firecrawl):
                </label>
                <input
                  className="glass-input"
                  style={{ width: '100%' }}
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                  Chunk Character Limit (Semantic Window):
                </label>
                <input
                  className="glass-input"
                  style={{ width: '100%' }}
                  type="number"
                  min={100}
                  max={2000}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  Recommended: 500 characters per chunk for high similarity precision.
                </span>
              </div>

              <button className="btn-primary" type="submit" disabled={isLoading} style={{ marginTop: '8px' }}>
                {isLoading ? <Sparkles className="animate-spin" size={16} /> : <Globe size={16} />}
                {isLoading ? 'Crawling & Vectorizing...' : 'Scrape & Ingest via Firecrawl'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleIngestText} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                  Document Title:
                </label>
                <input
                  className="glass-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. FreeAcademy RAG Module Architecture Notes"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                  Source URL (Optional):
                </label>
                <input
                  className="glass-input"
                  style={{ width: '100%' }}
                  placeholder="https://freeacademy.ai/lessons/memory-and-context-rag"
                  value={textSourceUrl}
                  onChange={(e) => setTextSourceUrl(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                  Raw Document Content:
                </label>
                <textarea
                  className="glass-input"
                  style={{ width: '100%', minHeight: '160px', resize: 'vertical' }}
                  placeholder="Paste lesson markdown, article text, or manual facts here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  required
                />
              </div>

              <button className="btn-primary" type="submit" disabled={isLoading}>
                {isLoading ? <Sparkles className="animate-spin" size={16} /> : <FileText size={16} />}
                {isLoading ? 'Processing Vectors...' : 'Vectorize Document'}
              </button>
            </form>
          )}

        </div>

        {/* Existing Documents List */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="var(--primary)" />
            Ingested Documents ({docStats?.documents?.length || 0})
          </h3>

          {!docStats?.documents || docStats.documents.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '12px', textAlign: 'center', padding: '30px 0' }}>
              No documents ingested yet. Submit a URL above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
              {docStats.documents.map((doc) => (
                <div key={doc.id} style={{ background: 'rgba(13, 21, 39, 0.7)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                    {doc.title}
                  </div>
                  {doc.source_url && (
                    <a href={doc.source_url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#67e8f9', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.source_url} ↗
                    </a>
                  )}
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px' }}>
                    Added: {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
