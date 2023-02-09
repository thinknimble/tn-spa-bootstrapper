describe('Tests login workflow', () => {
  it('Home page auto redirects to login', () => {
    cy.visit('/')
    cy.url().should('include', '/log-in')
  }),
  it('Filling in email and passwords goes to dashboard', () => {
    cy.get('[data-cy=login-email]').type('cypress@example.com')
    cy.get('[data-cy=login-password]').type(Cypress.env('TEST_USER_PASS'))
    cy.contains('[data-cy=login-submit]', 'Log in').click()
    cy.url().should('include', '/dashboard')
  })
})
