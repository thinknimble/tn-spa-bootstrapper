describe('Tests login workflow', () => {
  it('Home page auto redirects to login', () => {
    cy.visit('/')
    cy.url().should('include', '/log-in')
  })
  it('Filling in email and passwords goes to', () => {
    cy.get('[data-cy=email]').type(Cypress.env('TEST_USER_EMAIL'))
    cy.get('[data-cy=password]').type(Cypress.env('TEST_USER_PASS'))
    cy.get('[data-cy="login-btn"]').click()
    cy.url().should('include', '/home')
  })
})
 