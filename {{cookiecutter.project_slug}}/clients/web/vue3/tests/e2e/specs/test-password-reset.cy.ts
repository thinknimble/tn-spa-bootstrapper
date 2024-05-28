describe('Tests password reset workflow', () => {
  it('Login page has link to reset password', () => {
    cy.visit('/login')
    cy.contains('[data-cy=password-reset]', 'Forgot password?')
  })

  it('Submitting email doesnt throw error', () => {
    cy.visit('/login')
    cy.contains('[data-cy=password-reset]', 'Forgot password?').click()
    cy.url().should('include', '/password/request-reset/')
    cy.get('[data-cy=email]').type(Cypress.env('TEST_USER_EMAIL'))
    cy.contains('[data-cy=submit]', 'Request Password Reset').click()
    cy.get('[data-cy=submit-success]').should('contain.text', 'Your request has been submitted')
  })
})
