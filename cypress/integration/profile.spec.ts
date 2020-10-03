import { login, navigateFromUserMenu } from '../support/commands'

describe('Profile Management', () => {
  it('Should update the password', () => {
    cy.visit('/')
    login(cy, 'testuser@gmail.com', 'password')
    navigateFromUserMenu(cy, 'Profile')
    cy.get('.shade-tabs-header-container').contains('Change Password').scrollIntoView().click()
    // ToDo
    // cy.contains('Current password').get('input').type('password')
    // cy.contains('New password').get('input').type('newPassword')
    // cy.contains('Confirm new password').get('input').type('newPasswordMistaken')
    // cy.get('button').contains('Change password').click()
  })
})
