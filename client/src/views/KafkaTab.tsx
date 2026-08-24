import React from 'react'
import { KafkaStatusResponse } from '@/types'
import { Activity, Radio, Database, RefreshCw, Send, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react'

interface KafkaTabProps {
  kafkaStatus: KafkaStatusResponse | null
  isRefreshing: boolean
  loadStatus: () => void
}

export const KafkaTab: React.FC<KafkaTabProps> = ({
  kafkaStatus,
  isRefreshing,
  loadStatus
}) => {

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity color="#f59e0b" />
            Apache Kafka Event Streaming Hub
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Asynchronous message bus powered by **kafkajs**. Offloads Firecrawl web ingestion (`rag.ingest`), user memory extraction (`memory.extract`), and search auditing (`search.audit`).
          </p>
        </div>

        <button className="btn-secondary" onClick={loadStatus} disabled={isRefreshing}>
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh Topics & Logs
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        
        {/* Status & Topic Summary Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Connection Status Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={16} color="#f59e0b" /> Broker Status
            </h3>

            <div style={{
              padding: '12px',
              borderRadius: '8px',
              background: kafkaStatus?.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: kafkaStatus?.connected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
              color: kafkaStatus?.connected ? '#6ee7b7' : '#fcd34d',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {kafkaStatus?.connected ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
              <div>
                <div style={{ fontWeight: '600' }}>{kafkaStatus?.connected ? 'Kafka Connected' : 'Event Stream Active'}</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>
                  {kafkaStatus?.connected ? 'Cluster: kafka:29092' : 'Local Fallback Logger'}
                </div>
              </div>
            </div>
          </div>

          {/* Topics Card */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Active Kafka Topics</h3>
            
            <div style={{ background: 'rgba(13, 21, 39, 0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#67e8f9', marginBottom: '4px' }}>rag.ingest</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Async Firecrawl web crawling & vector storage</div>
            </div>

            <div style={{ background: 'rgba(13, 21, 39, 0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#a5b4fc', marginBottom: '4px' }}>memory.extract</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Background Zod memory extraction worker</div>
            </div>

            <div style={{ background: 'rgba(13, 21, 39, 0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6ee7b7', marginBottom: '4px' }}>search.audit</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tavily web grounding & RAG query audit log</div>
            </div>
          </div>

        </div>

        {/* Real-time Streaming Logs Feed */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--primary)" />
            Real-Time Kafka Event Stream ({kafkaStatus?.logs?.length || 0} events)
          </h3>

          {!kafkaStatus?.logs || kafkaStatus.logs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '60px 0', fontSize: '13px' }}>
              No Kafka events streamed yet. Send a chat message or scrape a URL to produce events!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
              {kafkaStatus.logs.map((log) => (
                <div
                  key={log.id}
                  className="animate-fade-in"
                  style={{
                    background: 'rgba(13, 21, 39, 0.85)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-amber">{log.topic}</span>
                      <span style={{ fontSize: '11px', color: log.status === 'published' ? '#6ee7b7' : '#a5b4fc' }}>
                        ● {log.status}
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <pre style={{
                    margin: 0,
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#f8fafc',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '8px',
                    borderRadius: '6px',
                    overflowX: 'auto'
                  }}>
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
