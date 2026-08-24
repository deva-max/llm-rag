import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ApiCredentials, MemoryRecord } from '@/types'
import { ApiOperations } from '@/operations/api.operation'
import { HttpErrorResponse } from '@/utils/errors'
import { TOAST_MESSAGES } from '@/config/messages/toast.messages'
import { MemoriesTab } from '@/views/MemoriesTab'

export const MemoriesTabController: React.FC = () => {
  const { creds } = useOutletContext<{ creds: ApiCredentials }>()
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState<any>('preference')
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadMemories = async () => {
    setIsLoading(true)
    try {
      const data = await ApiOperations.fetchMemories()
      setMemories(data.memories)
    } catch (err) {
      console.warn('Failed to load memories:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMemories()
  }, [])

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim()) return

    try {
      await ApiOperations.addMemory(newContent, newCategory, 1.0, 'manual')
      setNewContent('')
      setStatusMsg({ type: 'success', text: TOAST_MESSAGES.SUCCESS.MEMORY_SAVED })
      setTimeout(() => setStatusMsg(null), 4000)
      loadMemories()
    } catch (err) {
      const message = err instanceof HttpErrorResponse ? err.message : 'Unknown error'
      setStatusMsg({ type: 'error', text: `${TOAST_MESSAGES.ERROR.MEMORY_ACTION_FAILED} ${message}` })
      setTimeout(() => setStatusMsg(null), 4000)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await ApiOperations.deleteMemory(id)
      setMemories((prev) => prev.filter((m) => m.id !== id))
      setStatusMsg({ type: 'success', text: TOAST_MESSAGES.SUCCESS.MEMORY_DELETED })
      setTimeout(() => setStatusMsg(null), 4000)
    } catch (err) {
      const message = err instanceof HttpErrorResponse ? err.message : 'Unknown error'
      setStatusMsg({ type: 'error', text: `${TOAST_MESSAGES.ERROR.MEMORY_ACTION_FAILED} ${message}` })
      setTimeout(() => setStatusMsg(null), 4000)
    }
  }

  return (
    <MemoriesTab
      memories={memories}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      isLoading={isLoading}
      newContent={newContent}
      setNewContent={setNewContent}
      newCategory={newCategory}
      setNewCategory={setNewCategory}
      statusMsg={statusMsg}
      loadMemories={loadMemories}
      handleAddMemory={handleAddMemory}
      handleDelete={handleDelete}
    />
  )
}
