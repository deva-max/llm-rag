import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client/react'
import { appRouter } from '@/router/app.router'
import { apolloClient } from '@/operations/api.operation'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={appRouter} />
    </ApolloProvider>
  </React.StrictMode>
)
