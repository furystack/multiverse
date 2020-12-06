import { serviceNames } from '../../common/models'

export const login = (cy: Cypress.cy, username: string, password: string) => {
  const loginButtonSelector = 'shade-login button[type=submit]'
  const usernameInputSelector = 'shade-login input[type=text][title=username]'
  const passwordFieldSelector = 'shade-login input[type=password]'
  cy.visit('/', { timeout: 120000 })
  cy.get(usernameInputSelector).type(username).blur()
  cy.get(passwordFieldSelector).type(password).blur()
  cy.get(loginButtonSelector).click()
}

export const openUserMenu = (cy: Cypress.cy) => {
  cy.get('shade-current-user-menu').click()
}

export const logoutFromUserMenu = (cy: Cypress.cy) => {
  openUserMenu(cy)
  cy.get('shade-current-user-menu a[title="Log out"]').click()
}

export const navigateFromUserMenu = (cy: Cypress.cy, app: typeof serviceNames[number]) => {
  openUserMenu(cy)
  cy.get(`shade-current-user-menu`).contains(app).scrollIntoView().click()
}
