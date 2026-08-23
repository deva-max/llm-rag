import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ApiCredentials, ConfigStatus } from '@/types'
import { ApiOperations } from '@/operations/api.operation'
import { HttpErrorResponse } from '@/utils/errors'
import { Settings, Key, Database, Globe, Search, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react'

export const SettingsTab: React.FC = () => {
  const { creds, setCreds, configStatus, refreshStatus } = useOutletContext<{
    creds: ApiCredentials
    setCreds: (creds: ApiCredentials) => void
    configStatus: ConfigStatus | null
    refreshStatus: () => void
  }>()
  const [formState, setFormState] = useState<ApiCredentials>(creds)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreds(formState)
    localStorage.setItem('rag_api_credentials', JSON.stringify(formState))
    try {
      await ApiOperations.updateConfig(formState)
      setSaveSuccess(true)
      refreshStatus()
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e) {
      const message = e instanceof HttpErrorResponse ? e.message : 'Unknown error'
      alert(`Failed to save config: ${message}`)
    }
  }

  const supabaseSqlScript = `-- Enable Vector Extension in Supabase PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Create Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_policy(),
  title TEXT NOT NULL,
  source_url TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Document Chunks Table with Vector Embeddings (1536 dimension)
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_policy(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Long-Term Memories Table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_policy(),
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  confidence FLOAT DEFAULT 1.0,
  embedding vector(1536),
  source TEXT DEFAULT 'chat_extraction',
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Vector Similarity Search Function for Document Chunks
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Vector Similarity Search Function for Memories
CREATE OR REPLACE FUNCTION match_memories (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  category TEXT,
  confidence FLOAT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.category,
    m.confidence,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM memories m
  WHERE 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;`

  const copySql = () => {
    navigator.clipboard.writeText(supabaseSqlScript)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 3000)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings color="var(--primary)" />
          API Credentials & Supabase Configuration
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Manage your personal free-tier **Supabase**, **OpenAI**, **Firecrawl**, and **Tavily** credentials. Credentials can be saved locally or configured in `.env`.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: '24px' }}>
        
        {/* API Credentials Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--accent-cyan)" />
            API Key Manager
          </h3>

          {saveSuccess && (
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontSize: '13px', marginBottom: '16px' }}>
              ✓ Credentials updated and synced with server!
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Supabase URL */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Database size={14} color="#67e8f9" /> Supabase URL</span>
                {configStatus?.supabaseConfigured ? <span style={{ color: '#6ee7b7', fontSize: '11px' }}>✓ Configured</span> : <span style={{ color: '#fcd34d', fontSize: '11px' }}>Using In-Memory Fallback</span>}
              </label>
              <input
                className="glass-input"
                style={{ width: '100%' }}
                type="url"
                placeholder="https://your-project.supabase.co"
                value={formState.supabaseUrl}
                onChange={(e) => setFormState({ ...formState, supabaseUrl: e.target.value })}
              />
            </div>

            {/* Supabase Key */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Supabase Anon / Service Key
              </label>
              <input
                className="glass-input"
                style={{ width: '100%' }}
                type="password"
                placeholder="ey..."
                value={formState.supabaseKey}
                onChange={(e) => setFormState({ ...formState, supabaseKey: e.target.value })}
              />
            </div>

            {/* OpenAI API Key */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span>OpenAI API Key (for GPT completion & Embeddings)</span>
                {configStatus?.openaiConfigured ? <span style={{ color: '#6ee7b7', fontSize: '11px' }}>✓ Configured</span> : <span style={{ color: '#fcd34d', fontSize: '11px' }}>Using Local Vector Fallback</span>}
              </label>
              <input
                className="glass-input"
                style={{ width: '100%' }}
                type="password"
                placeholder="sk-..."
                value={formState.openaiApiKey}
                onChange={(e) => setFormState({ ...formState, openaiApiKey: e.target.value })}
              />
            </div>

            {/* Firecrawl API Key */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} color="#a5b4fc" /> Firecrawl API Key</span>
                {configStatus?.firecrawlConfigured ? <span style={{ color: '#6ee7b7', fontSize: '11px' }}>✓ Configured</span> : <span style={{ color: '#fcd34d', fontSize: '11px' }}>Using HTTP Fallback</span>}
              </label>
              <input
                className="glass-input"
                style={{ width: '100%' }}
                type="password"
                placeholder="fc-..."
                value={formState.firecrawlApiKey}
                onChange={(e) => setFormState({ ...formState, firecrawlApiKey: e.target.value })}
              />
            </div>

            {/* Tavily API Key */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Search size={14} color="#6ee7b7" /> Tavily AI Search API Key</span>
                {configStatus?.tavilyConfigured ? <span style={{ color: '#6ee7b7', fontSize: '11px' }}>✓ Configured</span> : <span style={{ color: '#fcd34d', fontSize: '11px' }}>Using Demo Grounding</span>}
              </label>
              <input
                className="glass-input"
                style={{ width: '100%' }}
                type="password"
                placeholder="tvly-..."
                value={formState.tavilyApiKey}
                onChange={(e) => setFormState({ ...formState, tavilyApiKey: e.target.value })}
              />
            </div>

            <button className="btn-primary" type="submit" style={{ marginTop: '10px' }}>
              Save Credentials & Update Server
            </button>
          </form>

        </div>

        {/* Supabase Schema SQL Viewer Widget */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="var(--primary)" />
              Supabase SQL Migration Script
            </h3>
            <button className="btn-secondary" onClick={copySql} style={{ padding: '6px 12px', fontSize: '12px' }}>
              {copiedSql ? <Check size={14} color="#6ee7b7" /> : <Copy size={14} />}
              {copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Paste this SQL script into your **Supabase SQL Editor** to create the vector extension, `documents`, `document_chunks`, `memories` tables, and cosine RPC match functions.
          </p>

          <pre style={{
            background: 'rgba(13, 21, 39, 0.95)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#a5b4fc',
            overflowX: 'auto',
            maxHeight: '340px',
            whiteSpace: 'pre'
          }}>
            {supabaseSqlScript}
          </pre>
        </div>

      </div>

    </div>
  )
}
