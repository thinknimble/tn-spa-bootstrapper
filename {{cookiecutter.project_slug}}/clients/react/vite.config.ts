/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tsconfigPaths()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setup-tests.ts',
    },
    {% if cookiecutter.use_graphql == 'n' -%}
    server: {
      proxy: {
        [base]: {
          target: (env.VITE_DEV_BACKEND_URL || 'http://server:8000') +base,
          changeOrigin: true,
          rewrite: (path) => path.replace(regex, ''),
        },
      },
    },
    {% endif -%}
  }
})
