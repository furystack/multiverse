import { login, openUserMenu } from '../support/commands'

describe('Logging', () => {
  it('Should be available from the Dashboard', () => {
    login(cy, 'testuser@gmail.com', 'password')
    cy.get('shade-welcome-screen-widget').contains('System Logs').scrollIntoView().click()
    cy.get('log-level-cell')
  })

  it('Should be available from the User menu', () => {
    login(cy, 'testuser@gmail.com', 'password')
    openUserMenu(cy)
    cy.get('shade-current-user-menu').contains('System Logs').scrollIntoView().click()
    cy.get('log-level-cell')
  })

  it('Should open a log entry details with double click', () => {
    login(cy, 'testuser@gmail.com', 'password')
    cy.get('shade-welcome-screen-widget').contains('System Logs').scrollIntoView().click()
    cy.get('log-level-cell').last().scrollIntoView().dblclick()
    cy.contains('Event Details').should('be.visible')
    cy.get('button').contains('Back').click()
    cy.get('log-level-cell').last().scrollIntoView().should('be.visible')
  })
})
