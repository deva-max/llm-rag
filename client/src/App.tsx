import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ApiCredentials, ConfigStatus, TabType } from '@/types'
import { ApiOperations } from '@/operations/api.operation'
import { Navigation } from '@/views/Navigation'

const App: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [creds, setCreds] = useState<ApiCredentials>(() => {
    const saved = localStorage.getItem('rag_api_credentials')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return {
      supabaseUrl: '',
      supabaseKey: '',
      openaiApiKey: '',
      firecrawlApiKey: '',
      tavilyApiKey: ''
    }
  })
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)

  const refreshStatus = async () => {
    try {
      // In a real app we might pass creds in headers via Axios interceptor, but here we set them in localstorage for the backend
      const status = await ApiOperations.fetchConfigStatus()
      setConfigStatus(status)
    } catch (e) {
      console.warn('Failed to fetch status:', e)
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [creds])

  // Derive active tab from location pathname
  const activeTab: TabType = (location.pathname.replace('/', '') || 'chat') as TabType

  const handleSelectTab = (tab: TabType) => {
    if (tab === 'chat') navigate('/')
    else navigate(`/${tab}`)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        configStatus={configStatus}
      />
      <main style={{ flex: 1, padding: '0 24px 32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <Outlet context={{ creds, setCreds, configStatus, refreshStatus }} />
      </main>
    </div>
  )
}

export default App

