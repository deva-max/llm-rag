import React from 'react'
import { MemoryRecord } from '@/types'
import { Brain, Plus, Trash2, Sparkles, Filter } from 'lucide-react'

interface MemoriesTabProps {
  memories: MemoryRecord[]
  selectedCategory: string
  setSelectedCategory: (val: string) => void
  isLoading: boolean
  newContent: string
  setNewContent: (val: string) => void
  newCategory: string
  setNewCategory: (val: string) => void
  statusMsg: { type: 'success' | 'error'; text: string } | null
  loadMemories: () => void
  handleAddMemory: (e: React.FormEvent) => void
  handleDelete: (id: string) => void
}

export const MemoriesTab: React.FC<MemoriesTabProps> = ({
  memories,
  selectedCategory,
  setSelectedCategory,
  isLoading,
  newContent,
  setNewContent,
  newCategory,
  setNewCategory,
  statusMsg,
  loadMemories,
  handleAddMemory,
  handleDelete
}) => {

  const filteredMemories = memories.filter((m) =>
    selectedCategory === 'all' ? true : m.category === selectedCategory
  )

  const categoryBadge = (cat: string) => {
    switch (cat) {
      case 'preference': return 'badge-indigo'
      case 'fact': return 'badge-cyan'
      case 'goal': return 'badge-amber'
      case 'entity': return 'badge-emerald'
      default: return 'badge-indigo'
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain color="#a5b4fc" />
            Supabase Long-Term Memory Explorer
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Inspect facts, preferences, and entity memories extracted automatically via Zod or added manually. Stored in Supabase `memories` table with vector cosine indexing.
          </p>
        </div>

        <button className="btn-secondary" onClick={loadMemories}>
          <Sparkles size={16} /> Refresh Memories ({memories.length})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        
        {/* Memories Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Category Filter Bar */}
          <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <Filter size={16} />
              <span>Filter Category:</span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'preference', 'fact', 'goal', 'entity', 'general'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    border: selectedCategory === cat ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                    color: selectedCategory === cat ? '#a5b4fc' : 'var(--text-muted)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px', textTransform: 'uppercase', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              Loading memories from Supabase...
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              No memories found in category "{selectedCategory}". Start chatting or add one manually!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredMemories.map((mem) => (
                <div key={mem.id} className="glass-card animate-fade-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={`badge ${categoryBadge(mem.category)}`}>{mem.category}</span>
                      <button
                        onClick={() => handleDelete(mem.id)}
                        style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', opacity: 0.7 }}
                        title="Delete Memory"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p style={{ fontSize: '13px', lineHeight: '1.5', margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                      {mem.content}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    <span>Source: {mem.source}</span>
                    <span>Confidence: {(mem.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Add Memory Sidebar */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="var(--primary)" />
            Add Manual Memory
          </h3>

          {statusMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: statusMsg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: statusMsg.type === 'success' ? '#6ee7b7' : '#fca5a5',
              fontSize: '12px'
            }}>
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                Memory Category:
              </label>
              <select
                className="glass-input"
                style={{ width: '100%' }}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="preference">Preference (e.g. Likes TypeScript)</option>
                <option value="fact">Fact (e.g. User lives in NY)</option>
                <option value="goal">Goal (e.g. Building RAG app)</option>
                <option value="entity">Entity (e.g. Project Name)</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                Memory Content:
              </label>
              <textarea
                className="glass-input"
                style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                placeholder="e.g. User is building a full-stack RAG app using Supabase pgvector."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
              />
            </div>

            <button className="btn-primary" type="submit">
              <Brain size={16} /> Save Memory to Vector Store
            </button>
          </form>

        </div>

      </div>

    </div>
  )
}
