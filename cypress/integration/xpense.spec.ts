import { v4 } from 'uuid'
import { login, openUserMenu } from '../support/commands'

describe('Xpense', () => {
  it('Should be available from the Dashboard', () => {
    login(cy, 'testuser@gmail.com', 'password')
    cy.get('shade-welcome-screen-widget').contains('Xpense').scrollIntoView().click()
    cy.get('xpense-index')
  })

  it('Should be available from the User menu', () => {
    login(cy, 'testuser@gmail.com', 'password')
    openUserMenu(cy)
    cy.get('shade-current-user-menu').contains('Xpense').scrollIntoView().click()
    cy.get('xpense-index')
  })

  it.only('Should create and select Account', () => {
    const accountName = `test-${v4()}`
    login(cy, 'testuser@gmail.com', 'password')
    cy.get('shade-welcome-screen-widget').contains('Xpense').scrollIntoView().click()
    cy.get('shade-fab div[title="Create Account"]').click()
    cy.get('input[name=icon]').type('🧪')
    cy.get('input[name=name]').type(accountName)
    cy.get('div.account-description').type('Test Description')
    cy.get('Button').contains('Create Account').click()
    cy.contains(accountName).scrollIntoView().should('be.visible')
  })

  it.skip('Should create a Shopping', () => {
    /** */
  })

  it.skip('Should check the History', () => {
    /** */
  })
})
