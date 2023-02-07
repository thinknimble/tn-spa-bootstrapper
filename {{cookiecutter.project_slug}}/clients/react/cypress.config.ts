import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8089',
    supportFile: 'tests/e2e/support/e2e.ts',
    specPattern:'**/*.cy.{js,jsx,ts,tsx}'
  },
})
