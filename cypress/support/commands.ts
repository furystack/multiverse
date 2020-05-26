export const login = (cy: Cypress.cy, username: string, password: string) => {
  const loginButtonSelector = 'shade-login button[type=submit]'
  const usernameInputSelector = 'shade-login input[type=text][title=username]'
  const passwordFieldSelector = 'shade-login input[type=password]'
  cy.visit('/')
  cy.get(usernameInputSelector).type(username).blur()
  cy.get(passwordFieldSelector).type(password).blur()
  cy.log('Logging in...')
  cy.get(loginButtonSelector).click()
}

export const openUserMenu = (cy: Cypress.cy) => {
  cy.get('shade-current-user-menu').click()
}
