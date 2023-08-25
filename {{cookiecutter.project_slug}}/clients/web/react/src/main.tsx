{% if cookiecutter.use_graphql == 'y' -%}
import { ApolloProvider } from '@apollo/client'
import { client } from './services/apollo-client'
{% else -%}
import { QueryClientProvider } from '@tanstack/react-query'
{% endif -%}
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './index.css'
{% if cookiecutter.use_graphql == 'n' -%}
import { queryClient } from './utils/query-client'
{% endif -%}

const container = document.getElementById('root')
const root = createRoot(container!)


root.render(
  <React.StrictMode>
{% if cookiecutter.use_graphql == 'y' -%}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
{% else -%}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
{% endif -%}
  </React.StrictMode>,
)
