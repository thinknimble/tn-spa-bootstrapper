describe('Tests login workflow', () => {
  it('Home page auto redirects to login', () => {
    cy.visit('/')
    cy.url().should('include', '/log-in')
  })
})
