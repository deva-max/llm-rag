import React from 'react'
import { ApiCredentials, ConfigStatus } from '@/types'
import { Settings, Key, Database, Globe, Search, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react'

interface SettingsTabProps {
  configStatus: ConfigStatus | null
  formState: ApiCredentials
  setFormState: (val: ApiCredentials) => void
  saveSuccess: boolean
  copiedSql: boolean
  supabaseSqlScript: string
  handleSave: (e: React.FormEvent) => void
  copySql: () => void
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  configStatus,
  formState,
  setFormState,
  saveSuccess,
  copiedSql,
  supabaseSqlScript,
  handleSave,
  copySql
}) => {

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
