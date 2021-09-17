/// <reference types="cypress"/>


describe('', () => {
beforeEach(() => {
  cy.visit('/recover-password')
  cy.url().should('include', '/recover-password')
})



})