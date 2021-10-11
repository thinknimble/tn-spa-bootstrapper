/// <reference types="cypress"/>

/**
 * To get a better understanding of the methods used in the tests outlined below please review the cypress documentation
 * https://docs.cypress.io/
 */

describe('Tests authentication test cases', () => {
  beforeEach(() => {
    cy.visit('/login')
    // checks whether the url contains "/login"
    cy.url().should('include', '/login')

  })

  it('Check whether email and password elements exist on the screen', () => {
    cy.selectElement('#email', { identifier: 'have.id', val: 'email'}).should('be.visible')

    cy.selectElement('#password', {identifier: 'have.id', val: 'password'}).should('be.visible')
  })

  // check whether taking valid email
  it('Email input throws an error for invalid emails', () => {
    cy.selectElement('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('invalidEmail')).should('have.attr', 'aria-invalid', 'email must be a valid email')
  })

  // check whether password matches minimum length
  it('Check whether password meets minimum length requirements', () => {
    cy.selectElement('#password', {identifier: 'have.id', val: 'password'}).type(Cypress.env('invalidPassword')).should('have.attr', 'aria-invalid', 'password must be at least 8 characters')
  })

  // check for valid email
  it('Checks that valid emails do not throw errors', () => {
    cy.selectElement('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')
  })

  // check for valid password
  it('Checks whether input password meets minimum requirements', () => {
    cy.selectElement('#password', {identifier: 'have.id', val: 'password'}).type(Cypress.env('validPassword')).should('not.have.attr', 'aria-invalid', 'password must be at least 8 characters')
  })

  // test submit empty form
  context('Submit an empty login form', () => {
    it('Check whether email field is empty and throws an error', () => {
      cy.selectElement('button', {identifier: 'have.attr', val: 'type', action: 'submit'}).click()

      cy.selectElement('#email', { identifier: 'have.id', val: 'email' }).should('have.attr', 'aria-invalid', 'email is a required field')

      cy.selectElement('#password', {identifier: 'have.id', val: 'password'}).should('have.attr', 'aria-invalid', 'password is a required field')
    });

  })
  context('Submit invalid login credentials', () => {
    beforeEach(() => {
      cy.server()
    })
    it('Enter invalid login credentials', () => {

      cy.selectElement('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')

      cy.selectElement('#password', {identifier: 'have.id', val: 'password'}).type(Cypress.env('validPassword')).should('not.have.attr', 'aria-invalid', 'password must be at least 8 characters')

      cy.selectElement('button', {identifier: 'have.attr', val: 'type', action: 'submit'}).click()
      cy.selectElement('.test-invalid-credentials').should('be.visible')
    });

  })

})