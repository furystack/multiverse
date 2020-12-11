import { login, openUserMenu } from '../support/commands'

describe('Logging', () => {
  it('Should be available from the Dashboard with the sys-diags role', () => {
    login(cy, 'testSysDiags@gmail.com', 'password')
    cy.get('welcome-page').within(() => {
      cy.contains('System Logs').scrollIntoView().click()
    })
    cy.get('log-level-cell')
  })

  it('Should NOT be available from the User menu without the sys-diags role', () => {
    login(cy, 'testuser@gmail.com', 'password')
    openUserMenu(cy)
    cy.get('shade-current-user-menu').within(() => {
      cy.contains('System Logs').should('not.exist')
    })
  })

  it('Should be available from the User menu with the sys-diags role', () => {
    login(cy, 'testSysDiags@gmail.com', 'password')
    openUserMenu(cy)
    cy.get('shade-current-user-menu').within(() => {
      cy.contains('System Logs').scrollIntoView().click()
    })
    cy.get('log-level-cell')
  })

  it('Should open a log entry details with double click', () => {
    login(cy, 'testSysDiags@gmail.com', 'password')
    cy.visit('/diags/logs')
    cy.get('log-level-cell').last().scrollIntoView().dblclick()
    cy.contains('Event details').should('be.visible')
    cy.get('button[title="Go Back"]').click()
    cy.get('log-level-cell').last().scrollIntoView().should('be.visible')
  })
})
