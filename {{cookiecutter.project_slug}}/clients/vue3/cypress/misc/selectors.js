/// <reference types="cypress"/>

import { should } from "chai"



export const elementSelector = (tag, specifications) => {
  if (specifications === undefined) {
    return cy.get(tag)
  }
  return cy.get(tag).should(specifications.identifier, specifications.val, specifications.action)
}




