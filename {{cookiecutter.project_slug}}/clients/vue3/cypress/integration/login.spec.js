/// <reference types="cypress"/>
import * as selector from '../misc/selectors'

describe('Tests authentication test cases', () => {
  beforeEach(() => {
    cy.visit('/login')
    // checks whether the url contains "/login"
    cy.url().should('include', '/login')

  })

  it('Check whether email and password elements exist on the screen', () => {
    selector.elementSelector('#email', { identifier: 'have.id', val: 'email' }).should('be.visible')
    selector.elementSelector('#password', {identifier: 'have.id', val: 'password'}).should('be.visible')
  })

  // check whether taking valid email
  it('Email input throws an error for invalid emails', () => {
    selector.elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('invalidEmail')).should('have.attr', 'aria-invalid', 'email must be a valid email')
  })

  // check whether password matches minimum length
  it('Check whether password meets minimum length requirements', () => {
    selector.elementSelector('#password', {identifier: 'have.id', val: 'password'}).type(Cypress.env('invalidPassword')).should('have.attr', 'aria-invalid', 'password must be at least 8 characters')
  })

  // check for valid email
  it('Checks that valid emails do not throw errors', () => {
    selector.elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')
  })

  // check for valid password
  it('Checks whether input password meets minimum requirements', () => {
    selector.elementSelector('#password', {identifier: 'have.id', val: 'password'}).type(Cypress.env('validPassword')).should('not.have.attr', 'aria-invalid', 'password must be at least 8 characters')
  })

  // test submit empty form
  context('Submit an empty login form', () => {
    it('Check whether email field is empty and throws an error', () => {
      selector.elementSelector('button', {identifier: 'have.attr', val: 'type', action: 'submit'}).click()

      selector.elementSelector('#email', { identifier: 'have.id', val: 'email' }).should('have.attr', 'aria-invalid', 'email is a required field')

      selector.elementSelector('#password', {identifier: 'have.id', val: 'password'}).should('have.attr', 'aria-invalid', 'password is a required field')
    });

  })
  context('Submit invalid login credentials', () => {
    beforeEach(() => {
      cy.server()
    })
    it('Enter invalid login credentials', () => {

      selector.elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')

      selector.elementSelector('#password', {identifier: 'have.id', val: 'password'}).type(Cypress.env('validPassword')).should('not.have.attr', 'aria-invalid', 'password must be at least 8 characters')

      selector.elementSelector('button', {identifier: 'have.attr', val: 'type', action: 'submit'}).click()
      // cy.route('POST', '/api/todos', {
      //   id: 1,
      //   email: 'melissa@thinknimble.com',
      //   token: '27bsdu272'
      // }) //specify the request type
      selector.elementSelector('.test-invalid-credentials').should('be.visible')
    });

  })

})