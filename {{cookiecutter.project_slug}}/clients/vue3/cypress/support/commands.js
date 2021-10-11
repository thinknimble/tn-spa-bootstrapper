/**
 *
 * @param {*} tag
 * @param {*} specifications - identifier(a given attribute ie, class, attribute, id, etc), val(the value of the identifier, ie the class name or "submit"), action(the action that can be taken, for example a submit button can have an action of "submit")
 * @returns a selector for a given element
 */
Cypress.Commands.add('selectElement', (tag, specifications) => {
  if (specifications === undefined) {
    return cy.get(tag)
  }
  return cy.get(tag).should(specifications.identifier, specifications.val, specifications.action)
})