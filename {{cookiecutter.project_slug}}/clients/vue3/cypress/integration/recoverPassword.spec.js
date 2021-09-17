/// <reference types="cypress"/>
import * as selector from '../misc/selectors'


describe('Test all password reset cases', () => {
  beforeEach(() => {
    cy.visit('/recover-password')
    cy.url().should('include', '/recover-password')
  })

  it('Check whether the email field exists', () => {
    selector.elementSelector('#email', { identifier: 'have.id', val: 'email' }).should('be.visible')
  });

  // check whether taking valid email
  it('Email input throws an error for invalid emails', () => {

    selector.elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('invalidEmail')).should('have.attr', 'aria-invalid', 'email must be a valid email')

  })

  // check for valid email
  it('Checks that valid emails do not throw errors', () => {

    selector.elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')

  })

  context('Submit password recovery form', () => {
    it('Should submit email for password recovery', () => {

      selector.elementSelector('#email', { identifier: 'have.id', val: 'email' }).type(Cypress.env('loginEmail')).should('not.have.attr', 'aria-invalid', 'email must be a valid email')

      cy.get('button').should('have.attr', 'type', 'submit').click()
    })
  })
})