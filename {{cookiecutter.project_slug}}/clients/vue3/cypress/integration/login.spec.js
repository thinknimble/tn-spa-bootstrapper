/// <reference types="cypress"/>
import { elementSelector} from '../misc/selectors'

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
    elementSelector('#email', { identifier: 'have.id', val: 'email' }).should('be.visible')
    elementSelector('#password', {identifier: 'have.id', val: 'password'}).should('be.visible')
  })

  // check whether taking valid email
  it('Email input throws an error for invalid emails', () => {
    elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('invalidEmail')).should('have.attr', 'aria-invalid', 'email must be a valid email')
  })

  // check whether password matches minimum length
  it('Check whether password meets minimum length requirements', () => {
    elementSelector('#password', {identifier: 'have.id', val: 'password'}).type(Cypress.env('invalidPassword')).should('have.attr', 'aria-invalid', 'password must be at least 8 characters')
  })

  // check for valid email
  it('Checks that valid emails do not throw errors', () => {
    elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')
  })

  // check for valid password
  it('Checks whether input password meets minimum requirements', () => {
    elementSelector('#password', {identifier: 'have.id', val: 'password'}).type(Cypress.env('validPassword')).should('not.have.attr', 'aria-invalid', 'password must be at least 8 characters')
  })

  // test submit empty form
  context('Submit an empty login form', () => {
    it('Check whether email field is empty and throws an error', () => {
      elementSelector('button', {identifier: 'have.attr', val: 'type', action: 'submit'}).click()

      elementSelector('#email', { identifier: 'have.id', val: 'email' }).should('have.attr', 'aria-invalid', 'email is a required field')

      elementSelector('#password', {identifier: 'have.id', val: 'password'}).should('have.attr', 'aria-invalid', 'password is a required field')
    });

  })
  context('Submit invalid login credentials', () => {
    beforeEach(() => {
      cy.server()
    })
    it('Enter invalid login credentials', () => {

      elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')

      elementSelector('#password', {identifier: 'have.id', val: 'password'}).type(Cypress.env('validPassword')).should('not.have.attr', 'aria-invalid', 'password must be at least 8 characters')

      elementSelector('button', {identifier: 'have.attr', val: 'type', action: 'submit'}).click()
      elementSelector('.test-invalid-credentials').should('be.visible')
    });

  })

})