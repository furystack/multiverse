import 'cypress-file-upload'
import { serviceNames } from '../../common/models'
import * as compareSnapshotCommand from 'cypress-visual-regression/dist/command'

export const tryLogin = (cy: Cypress.cy, username: string, password: string) => {
  const loginButtonSelector = 'shade-login button[type=submit]'
  const usernameInputSelector = 'shade-login input[type=text][title=username]'
  const passwordFieldSelector = 'shade-login input[type=password]'
  cy.visit('/', { timeout: 120000 })
  cy.get(usernameInputSelector).clear().type(username).blur()
  cy.get(passwordFieldSelector).clear().type(password).blur()
  cy.get(loginButtonSelector).click()
}

export const login = (cy: Cypress.cy, username: string, password: string) => {
  tryLogin(cy, username, password)
  expectAndDismissNotification(cy, 'Welcome back ;)', 'success')
}

export const openUserMenu = (cy: Cypress.cy) => {
  cy.get('shade-current-user-menu').click()
}

export const logoutFromUserMenu = (cy: Cypress.cy) => {
  openUserMenu(cy)
  cy.get('shade-current-user-menu a[title="Log out"]').click()
  expectAndDismissNotification(cy, 'Come back soon...', 'info')
}

export const navigateFromUserMenu = (cy: Cypress.cy, app: typeof serviceNames[number]) => {
  openUserMenu(cy)
  cy.get(`shade-current-user-menu`).contains(app).scrollIntoView().click()
}

export const expectAndDismissNotification = (
  cy: Cypress.cy,
  text: string,
  type?: 'error' | 'warning' | 'info' | 'success',
) => {
  cy.get(`shade-noty div.noty${type ? `.${type}` : ''}`).within(() => {
    cy.contains(text)
      .should('be.visible')
      .parent()
      .get('button.dismissNoty')
      .should('be.visible')
      .click()
      .should('not.exist')
  })
}

compareSnapshotCommand()

Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from
  // failing the test

  // "ResizeObserver loop limit exceeded" exception is more of a warning than an error, we don't want our tests to fail because of it.
  if (err.message.includes('ResizeObserver loop limit exceeded')) return false
  return true
})
