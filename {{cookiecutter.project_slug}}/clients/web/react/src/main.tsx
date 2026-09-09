import { QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary, Provider as RollbarProvider } from '@rollbar/react'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { rollbarConfig } from './config/rollbar'
import './index.css'
import { queryClient } from './utils/query-client'
import { ToastProvider } from './components/toast'

const ErrorFallback = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
    <h1 className="text-xl font-semibold">Something went wrong</h1>
    <p className="text-sm text-gray-500">
      An unexpected error occurred. Please refresh the page and try again.
    </p>
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="rounded bg-black px-4 py-2 text-white"
    >
      Reload
    </button>
  </div>
)

const container = document.getElementById('root')
const root = createRoot(container!)

// RollbarProvider installs the browser error client (captureUncaught +
// captureUnhandledRejections). ErrorBoundary reports a render crash and shows
// ErrorFallback instead of a blank page. Both no-op when rollbarConfig.enabled is
// false (local / no token for the detected env).
root.render(
  <React.StrictMode>
    <RollbarProvider config={rollbarConfig}>
      <ErrorBoundary fallbackUI={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <App />
          </ToastProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </RollbarProvider>
  </React.StrictMode>,
)
