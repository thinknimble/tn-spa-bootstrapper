/// <reference types="cypress"/>


describe('Tests authentication test cases', () => {
  beforeEach(() => {
    cy.visit('/')
    // checks whether the url contains "/login"
    cy.url().should('include', '/login')

  })

  it('Check whether email and password elements exist on the screen', () => {
    cy.get('#email').should('have.id', 'email').should('be.visible')
    cy.get('#password').should('have.id', 'password').should('be.visible')
  })

  // check whether taking valid email
  it('Email input throws an error for invalid emails', () => {
    cy.get('#email').should('have.id', 'email').type(Cypress.env('invalidEmail')).should('have.attr', 'aria-invalid', 'email must be a valid email')
  })

  // check whether password matches minimum length
  it('Check whether password meets minimum length requirements', () => {
    cy.get('#password').should('have.id', 'password').type(Cypress.env('invalidPassword')).should('have.attr', 'aria-invalid', 'password must be at least 8 characters')
  })

  // check for valid email
  it('Checks that valid emails do not throw errors', () => {
    cy.get('#email').should('have.id', 'email').type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')
  })

  // check for valid password
  it('Checks whether input password meets minimum requirements', () => {
    cy.get('#password').should('have.id', 'password').type(Cypress.env('validPassword')).should('not.have.attr', 'aria-invalid', 'password must be at least 8 characters')
  })

  // test submit empty form
  context('Submit an empty login form', () => {
    it('Check whether email field is empty and throws an error', () => {
      cy.get('button').should('have.attr', 'type', 'submit').click()
      cy.get('#email').should('have.id', 'email').should('have.attr', 'aria-invalid', 'email is a required field')
      cy.get('#password').should('have.id', 'password').should('have.attr', 'aria-invalid', 'password is a required field')
    });

  })
  context('Submit invalid login credentials', () => {
    it('Enter invalid login credentials', () => {

      cy.get('#email').should('have.id', 'email').type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')
      cy.get('#password').should('have.id', 'password').type(Cypress.env('validPassword')).should('not.have.attr', 'aria-invalid', 'password must be at least 8 characters')
      cy.get('button').should('have.attr', 'type', 'submit').click()
      cy.get('.test-invalid-credentials').should('be.visible')
    });

  })

  // spoof sucessful login
})