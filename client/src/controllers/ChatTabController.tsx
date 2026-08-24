import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Message, ApiCredentials } from '@/types'
import { ApiOperations } from '@/operations/api.operation'
import { HttpErrorResponse } from '@/utils/errors'
import { ChatTab } from '@/views/ChatTab'

export const ChatTabController: React.FC = () => {
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

  return (
    <ChatTab
      messages={messages}
      input={input}
      setInput={setInput}
      isLoading={isLoading}
      useRag={useRag}
      setUseRag={setUseRag}
      useTavily={useTavily}
      setUseTavily={setUseTavily}
      useMemory={useMemory}
      setUseMemory={setUseMemory}
      selectedMessageContext={selectedMessageContext}
      setSelectedMessageContext={setSelectedMessageContext}
      messagesEndRef={messagesEndRef}
      handleSend={handleSend}
    />
  )
}
