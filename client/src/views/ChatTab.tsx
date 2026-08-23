import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Message, ApiCredentials } from '@/types'
import { ApiOperations } from '@/operations/api.operation'
import { HttpErrorResponse } from '@/utils/errors'
import { Send, Bot, User, Brain, Database, Search, Sparkles, SlidersHorizontal, CheckCircle2, ChevronRight } from 'lucide-react'

export const ChatTab: React.FC = () => {
  const { creds } = useOutletContext<{ creds: ApiCredentials }>()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **Memory & Context RAG Engine**.\n\nI combine **Short-Term Memory**, **Long-Term Vector Memory (Supabase)**, **Vector Knowledge Base (pgvector)**, and **Live Web Grounding (Tavily)**.\n\nTry telling me something about yourself like: *"My name is Sarah and I prefer TypeScript over Python"* or ask a question!`,
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useRag, setUseRag] = useState(true)
  const [useTavily, setUseTavily] = useState(true)
  const [useMemory, setUseMemory] = useState(true)
  const [selectedMessageContext, setSelectedMessageContext] = useState<Message['ragContext'] | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || isLoading) return

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsLoading(true)

    try {
      const historyForApi = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content
      }))

      const res = await ApiOperations.chat(historyForApi, { useRag, useTavily, useMemory, ...creds })

      const assistantMsg: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString(),
        ragContext: {
          memoriesUsed: res.memoriesUsed || [],
          vectorChunksUsed: res.vectorChunksUsed || [],
          tavilyResultsUsed: res.tavilyResultsUsed || [],
          newMemoriesExtracted: res.newMemoriesExtracted || []
        }
      }

      setMessages((prev) => [...prev, assistantMsg])
      setSelectedMessageContext(assistantMsg.ragContext)
    } catch (err) {
      const message = err instanceof HttpErrorResponse ? err.message : 'Unknown error'
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error processing RAG completion: ${message}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const samplePrompts = [
    "My name is Sarah, I am building an AI startup in San Francisco.",
    "What do you remember about me and my goals?",
    "Search Tavily for latest developments in LLM Context Windows",
    "Explain how RAG memory architecture works in Supabase"
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', height: 'calc(100vh - 140px)' }}>
      
      {/* Main Chat Panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Controls Toolbar */}
        <div style={{
          padding: '12px 20px',
          background: 'rgba(255, 255, 255, 0.6)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <SlidersHorizontal size={16} color="var(--primary)" />
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>RAG Pipeline Controls:</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={useMemory} onChange={(e) => setUseMemory(e.target.checked)} />
              <Brain size={14} color="#a5b4fc" />
              <span>Memory Recall</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={useRag} onChange={(e) => setUseRag(e.target.checked)} />
              <Database size={14} color="#67e8f9" />
              <span>pgvector RAG</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={useTavily} onChange={(e) => setUseTavily(e.target.checked)} />
              <Search size={14} color="#6ee7b7" />
              <span>Tavily Grounding</span>
            </label>
          </div>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="animate-fade-in"
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: msg.role === 'user' ? '80%' : '90%'
              }}
            >
              {msg.role !== 'user' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={20} color="#fff" />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: msg.role === 'user' ? 'var(--primary-gradient)' : 'var(--bg-card)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                  color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  boxShadow: msg.role === 'user' ? '0 4px 15px rgba(99, 102, 241, 0.25)' : 'var(--shadow-card)'
                }}>
                  {msg.content}
                </div>

                {/* Context Badges on Assistant Messages */}
                {msg.ragContext && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {msg.ragContext.memoriesUsed.length > 0 && (
                      <span className="badge badge-indigo" onClick={() => setSelectedMessageContext(msg.ragContext)} style={{ cursor: 'pointer' }}>
                        <Brain size={10} /> {msg.ragContext.memoriesUsed.length} Memories Recalled
                      </span>
                    )}
                    {msg.ragContext.vectorChunksUsed.length > 0 && (
                      <span className="badge badge-cyan" onClick={() => setSelectedMessageContext(msg.ragContext)} style={{ cursor: 'pointer' }}>
                        <Database size={10} /> {msg.ragContext.vectorChunksUsed.length} Vector Chunks
                      </span>
                    )}
                    {msg.ragContext.tavilyResultsUsed.length > 0 && (
                      <span className="badge badge-emerald" onClick={() => setSelectedMessageContext(msg.ragContext)} style={{ cursor: 'pointer' }}>
                        <Search size={10} /> {msg.ragContext.tavilyResultsUsed.length} Web Sources
                      </span>
                    )}
                    {msg.ragContext.newMemoriesExtracted.length > 0 && (
                      <span className="badge badge-amber">
                        <Sparkles size={10} /> {msg.ragContext.newMemoriesExtracted.length} New Memory Extracted
                      </span>
                    )}
                  </div>
                )}

                <span style={{ fontSize: '10px', color: 'var(--text-dim)', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === 'user' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid var(--border-color)'
                }}>
                  <User size={20} color="var(--text-main)" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="#fff" className="animate-spin" />
              </div>
              <span>Searching Supabase pgvector + Tavily & Synthesizing response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sample Prompts */}
        <div style={{ padding: '0 20px 10px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '6px 12px',
                color: 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              ⚡ {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.6)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
          <input
            className="glass-input"
            style={{ flex: 1 }}
            placeholder="Type your message or tell me a preference (e.g. 'I prefer PostgreSQL and Zod')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button className="btn-primary" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
            <Send size={16} /> Send
          </button>
        </div>

      </div>

      {/* Side RAG & Memory Context Inspector */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={18} color="var(--primary)" />
          RAG Context Inspector
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          Real-time view of retrieved Supabase vector chunks, active memories, and Tavily web results used for synthesis.
        </p>

        {!selectedMessageContext ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', textAlign: 'center', gap: '8px' }}>
            <Sparkles size={32} />
            <span style={{ fontSize: '13px' }}>Send a message to inspect RAG grounding and memory extraction context.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Extracted Memories */}
            {selectedMessageContext.newMemoriesExtracted.length > 0 && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '12px' }}>
                <h4 style={{ fontSize: '12px', color: '#fcd34d', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> Memory Extracted (Zod Parsed)
                </h4>
                {selectedMessageContext.newMemoriesExtracted.map((m, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--text-main)', background: 'rgba(255,255,255,0.8)', padding: '6px 10px', borderRadius: '6px', marginBottom: '4px', border: '1px solid var(--border-color)' }}>
                    [{m.category}] {m.content}
                  </div>
                ))}
              </div>
            )}

            {/* Recalled Long-Term Memories */}
            <div>
              <h4 style={{ fontSize: '13px', color: '#a5b4fc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Brain size={14} /> Recalled Memories ({selectedMessageContext.memoriesUsed.length})
              </h4>
              {selectedMessageContext.memoriesUsed.length === 0 ? (
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No prior memories matched query embedding.</span>
              ) : (
                selectedMessageContext.memoriesUsed.map((m, i) => (
                  <div key={i} style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '8px', padding: '10px', marginBottom: '6px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                      <span className="badge badge-indigo">{m.category}</span>
                      <span>Sim: {(m.similarity * 100).toFixed(1)}%</span>
                    </div>
                    {m.content}
                  </div>
                ))
              )}
            </div>

            {/* Vector DB Chunks */}
            <div>
              <h4 style={{ fontSize: '13px', color: '#67e8f9', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={14} /> Vector Chunks ({selectedMessageContext.vectorChunksUsed.length})
              </h4>
              {selectedMessageContext.vectorChunksUsed.length === 0 ? (
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No document vector chunks retrieved. Ingest URLs via Firecrawl to populate!</span>
              ) : (
                selectedMessageContext.vectorChunksUsed.map((c, i) => (
                  <div key={i} style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px', padding: '10px', marginBottom: '6px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                      <span>Chunk #{i + 1}</span>
                      <span>Sim: {(c.similarity * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tavily Web Results */}
            <div>
              <h4 style={{ fontSize: '13px', color: '#6ee7b7', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} /> Tavily Web Grounding ({selectedMessageContext.tavilyResultsUsed.length})
              </h4>
              {selectedMessageContext.tavilyResultsUsed.length === 0 ? (
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Tavily search disabled or no results.</span>
              ) : (
                selectedMessageContext.tavilyResultsUsed.map((t, i) => (
                  <div key={i} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '10px', marginBottom: '6px', fontSize: '12px' }}>
                    <a href={t.url} target="_blank" rel="noreferrer" style={{ color: '#6ee7b7', textDecoration: 'none', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                      {t.title} ↗
                    </a>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.content}</div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  )
}
