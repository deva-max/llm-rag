import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { ChatTab } from '@/views/ChatTab'
import { IngestTab } from '@/views/IngestTab'
import { TavilyTab } from '@/views/TavilyTab'
import { MemoriesTab } from '@/views/MemoriesTab'
import { KafkaTab } from '@/views/KafkaTab'
import { SettingsTab } from '@/views/SettingsTab'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <ChatTab /> },
      { path: 'ingest', element: <IngestTab /> },
      { path: 'tavily', element: <TavilyTab /> },
      { path: 'memories', element: <MemoriesTab /> },
      { path: 'kafka', element: <KafkaTab /> },
      { path: 'settings', element: <SettingsTab /> }
    ]
  }
])
