import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    pluginsFile: 'tests/e2e/plugins/index.js',
  },
})
