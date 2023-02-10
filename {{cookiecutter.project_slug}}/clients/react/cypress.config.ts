import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    pluginsFile: 'tests/e2e/plugins/index.js',
  },
})
