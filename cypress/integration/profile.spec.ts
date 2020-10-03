import { login, logoutFromUserMenu, navigateFromUserMenu } from '../support/commands'

describe('Profile Management', () => {
  it('Should change the password and change it back', () => {
    cy.visit('/')
    login(cy, 'testuser@gmail.com', 'password')
    navigateFromUserMenu(cy, 'Profile')
    cy.get('.shade-tabs-header-container').contains('Change Password').scrollIntoView().click()

    cy.contains('Current password').find('input').type('password')
    cy.contains('New password').find('input').type('newPassword')
    cy.contains('Confirm new password').find('input').type('newPassword')
    cy.get('button').contains('Change password').click()
    logoutFromUserMenu(cy)

    login(cy, 'testuser@gmail.com', 'newPassword')
    navigateFromUserMenu(cy, 'Profile')
    cy.get('.shade-tabs-header-container').contains('Change Password').scrollIntoView().click()
    cy.contains('Current password').find('input').type('newPassword')
    cy.contains('New password').find('input').type('password')
    cy.contains('Confirm new password').find('input').type('password')
    cy.get('button').contains('Change password').click()
    logoutFromUserMenu(cy)

    login(cy, 'testuser@gmail.com', 'password')
  })
})
