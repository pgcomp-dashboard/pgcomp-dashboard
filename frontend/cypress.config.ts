const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{ts,js}',
    supportFile: 'cypress/support/e2e.ts',
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 60000,
    setupNodeEvents(on, config) {
    },
  },
});