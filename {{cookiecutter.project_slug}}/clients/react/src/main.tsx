import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './index.css'

const container = document.getElementById('root')
const root = createRoot(container!)
const qClient = new QueryClient()

root.render(
  <React.StrictMode>
    <QueryClientProvider client={qClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
