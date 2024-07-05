describe('Tests login workflow', () => {
  it('Home page has link to login', () => {
    cy.visit('/')
    cy.get('[data-cy=login]').click()
    cy.url().should('include', '/log-in')
  }),
    it('Home page auto redirects to login', () => {
      cy.visit('/log-in')
      cy.get('[data-cy=email]').type(Cypress.env('TEST_USER_EMAIL'))
      cy.get('[data-cy=password]').type(Cypress.env('TEST_USER_PASS'))
      cy.get('[data-cy=submit]').click()
      cy.url().should('include', '/dashboard')
    })
})
