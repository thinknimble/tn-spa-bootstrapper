import { QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './index.css'
import { queryClient } from './utils/query-client'

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
