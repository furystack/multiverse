import { v4 } from 'uuid'
import { login, openUserMenu } from '../support/commands'

describe('Xpense', () => {
  it('Should be available from the Dashboard', () => {
    login(cy, 'testuser@gmail.com', 'password')
    cy.get('welcome-page').contains('Xpense').scrollIntoView().click()
    cy.get('xpense-index')
  })

  it('Should be available from the User menu', () => {
    login(cy, 'testuser@gmail.com', 'password')
    openUserMenu(cy)
    cy.get('shade-current-user-menu').contains('Xpense').scrollIntoView().click()
    cy.get('xpense-index')
  })

  it('Should create and select Account', () => {
    const accountName = `test-${v4()}`
    login(cy, 'testuser@gmail.com', 'password')
    cy.get('welcome-page').contains('Xpense').scrollIntoView().click()
    cy.get('shade-fab div[title="Create Account"]').should('be.visible')
    cy.get('shade-fab div[title="Create Account"]').click()
    cy.get('input[name=icon]').type('🧪')
    cy.get('input[name=name]').type(accountName)
    cy.get('div.account-description').type('Test Description')
    cy.get('Button').contains('Create Account').click()
    cy.contains(accountName).scrollIntoView().should('be.visible')
  })

  it('Should create Replenishments and Shoppings and check their history', () => {
    /** Create Shopping -> Check Balance -> Goto History -> View Replenishment details -> Back to History -> View Shopping details */
    const accountName = `test-${v4()}`
    const replenishmentComment = `test-replenishment-${v4()}`
    const balance = Math.round(Math.random() * 10000)
    login(cy, 'testuser@gmail.com', 'password')
    cy.get('welcome-page').contains('Xpense').scrollIntoView().click()
    cy.get('shade-fab div[title="Create Account"]').click()
    cy.get('input[name=icon]').clear().type('🧪')
    cy.get('input[name=name]').type(accountName)
    cy.get('div.account-description').type('Test Description')
    cy.get('Button').contains('Create Account').click()
    cy.contains(accountName).scrollIntoView().click()
    cy.contains('Replenish').scrollIntoView().click()
    cy.get('input[name=amount]').type(balance.toString())
    cy.get('input[name=comment]').type(replenishmentComment)
    cy.on('window:confirm', () => true)
    cy.get('button').contains('Replenish').click()
    cy.get('xpense-selected-account-header .balance').should('be.visible')
    cy.contains(balance.toString()).should('be.visible')
  })
})
