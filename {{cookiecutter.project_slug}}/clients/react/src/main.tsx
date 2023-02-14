{% if cookiecutter.use_graphql == 'y' -%}
import { ApolloProvider } from '@apollo/client'
import { client } from './services/apollo-client'
{% else -%}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
{% endif -%}
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './index.css'

const container = document.getElementById('root')
const root = createRoot(container!)

{% if cookiecutter.use_graphql == 'n' -%}
const qClient = new QueryClient()
{% endif -%}

root.render(
  <React.StrictMode>
{% if cookiecutter.use_graphql == 'y' -%}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
{% else -%}
    <QueryClientProvider client={qClient}>
      <App />
    </QueryClientProvider>
{% endif -%}
  </React.StrictMode>,
)
