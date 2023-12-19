import { defineConfig } from 'cypress'
import pluginsFile from './tests/e2e/plugins'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    setupNodeEvents: pluginsFile,
    supportFile: 'tests/e2e/support/e2e.js',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
})
