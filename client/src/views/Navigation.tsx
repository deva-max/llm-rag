import React from 'react'
import { TabType, ConfigStatus } from '@/types'
import { MessageSquare, Globe, Search, Brain, Settings, Database, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'

interface NavigationProps {
  activeTab: TabType
  onSelectTab: (tab: TabType) => void
  configStatus: ConfigStatus | null
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  configStatus
}) => {
  const tabs = [
    { id: 'chat' as TabType, label: 'RAG & Memory Chat', icon: MessageSquare },
    { id: 'ingest' as TabType, label: 'Firecrawl Web Crawler', icon: Globe },
    { id: 'tavily' as TabType, label: 'Tavily AI Search', icon: Search },
    { id: 'memories' as TabType, label: 'Memory Explorer', icon: Brain },
    { id: 'kafka' as TabType, label: 'Kafka Event Stream', icon: Database },
    { id: 'settings' as TabType, label: 'Settings & Supabase SQL', icon: Settings }
  ]

  const totalServicesConfigured = configStatus
    ? [configStatus.supabaseConfigured, configStatus.openaiConfigured, configStatus.firecrawlConfigured, configStatus.tavilyConfigured].filter(Boolean).length
    : 0

  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="text-gradient">Memory & Context RAG</span>
              <span className="badge badge-indigo">FreeAcademy Module</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              React + Express (TS) • Supabase pgvector • Firecrawl • Tavily • Zod
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <nav style={{ display: 'flex', gap: '8px', background: 'rgba(13, 21, 39, 0.7)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                style={{
                  background: isActive ? 'var(--primary-gradient)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Integration Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={() => onSelectTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: totalServicesConfigured === 4 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: totalServicesConfigured === 4 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
              color: totalServicesConfigured === 4 ? '#6ee7b7' : '#fcd34d',
              cursor: 'pointer'
            }}
            title="Click to manage API Credentials"
          >
            {totalServicesConfigured === 4 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{totalServicesConfigured}/4 API Keys Active</span>
          </div>
        </div>

      </div>
    </header>
  )
}
