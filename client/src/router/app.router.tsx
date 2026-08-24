import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { ChatTabController } from '@/controllers/ChatTabController'
import { IngestTabController } from '@/controllers/IngestTabController'
import { TavilyTabController } from '@/controllers/TavilyTabController'
import { MemoriesTabController } from '@/controllers/MemoriesTabController'
import { KafkaTabController } from '@/controllers/KafkaTabController'
import { SettingsTabController } from '@/controllers/SettingsTabController'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <ChatTabController /> },
      { path: 'ingest', element: <IngestTabController /> },
      { path: 'tavily', element: <TavilyTabController /> },
      { path: 'memories', element: <MemoriesTabController /> },
      { path: 'kafka', element: <KafkaTabController /> },
      { path: 'settings', element: <SettingsTabController /> }
    ]
  }
])
