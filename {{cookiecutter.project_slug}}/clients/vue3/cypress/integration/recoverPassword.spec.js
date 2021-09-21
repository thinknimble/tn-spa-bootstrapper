/// <reference types="cypress"/>
import { elementSelector} from '../misc/selectors'

/**
 * To get a better understanding of the methods used in the tests outlined below please review the cypress documentation
 * https://docs.cypress.io/
 */

describe('Test all password reset test cases', () => {
  beforeEach(() => {
    cy.visit('/recover-password')
    cy.url().should('include', '/recover-password')
  })

  it('Check whether the email field exists', () => {
    elementSelector('#email', { identifier: 'have.id', val: 'email' }).should('be.visible')
  });

  // check whether invalid emails throw an error
  it('Email input throws an error for invalid emails', () => {

    elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('invalidEmail')).should('have.attr', 'aria-invalid', 'email must be a valid email')

  })

  // check that valid emails do not throw errors
  it('Checks that valid emails do not throw errors', () => {

    elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')

  })

  context('Submit password recovery form', () => {
    it('Should submit email for password recovery', () => {

      elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')

      cy.get('button').should('have.attr', 'type', 'submit').click()
    })
  })
})