import { expectAndDismissNotification, login, navigateFromUserMenu, openUserMenu } from '../support/commands'
import { v4 } from 'uuid'

describe('Dashboard', () => {
  it('Should be available from the User menu', () => {
    login(cy, 'testuser@gmail.com', 'password')
    navigateFromUserMenu(cy, 'Dashboards')
    cy.get('multiverse-dashboard-list')
  })

  it('Should create and select a dasboard', () => {
    const dashboardName = `test-${v4()}`
    const dashboardDescription = `test-${v4()}`
    login(cy, 'testuser@gmail.com', 'password')

    navigateFromUserMenu(cy, 'Dashboards')

    cy.get('shade-fab div[title="Create new dashboard"]').should('be.visible')
    cy.get('shade-fab div[title="Create new dashboard"]').scrollIntoView().click({ force: true })
    cy.get('input[name=dashboardName]').type(dashboardName)
    cy.get('input[name=dashboardDescription]').type(dashboardDescription)
    cy.get('Button').contains('Create Dashboard').click()

    expectAndDismissNotification(cy, 'The Dashboard has been created')

    cy.get('multiverse-edit-dashboard')

    navigateFromUserMenu(cy, 'Dashboards')
    cy.get('td').contains(dashboardName).should('be.visible')
    cy.get('td').contains(dashboardDescription).should('be.visible')
  })
})
