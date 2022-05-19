describe('Tests login workflow', () => {
  it('Home page has link to login', () => {
    cy.visit('/')
    cy.contains('#test-login', 'Login').click()
    cy.url().should('include', '/login')
  })

  it('Filling in email and passwords goes to', () => {
    cy.get('#test-email').type(Cypress.env('TEST_USER_EMAIL'))
    cy.get('#test-password').type(Cypress.env('TEST_USER_PASS'))
    cy.contains('#test-submit', 'Login').click()
    cy.url().should('include', '/dashboard')
  })
})
