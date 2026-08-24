import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ApiCredentials, ConfigStatus } from '@/types'
import { ApiOperations } from '@/operations/api.operation'
import { HttpErrorResponse } from '@/utils/errors'
import { SettingsTab } from '@/views/SettingsTab'

export const SettingsTabController: React.FC = () => {
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
    <SettingsTab
      configStatus={configStatus}
      formState={formState}
      setFormState={setFormState}
      saveSuccess={saveSuccess}
      copiedSql={copiedSql}
      supabaseSqlScript={supabaseSqlScript}
      handleSave={handleSave}
      copySql={copySql}
    />
  )
}
