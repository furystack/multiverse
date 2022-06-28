import {
  expectAndDismissNotification,
  login,
  logoutFromUserMenu,
  navigateFromUserMenu,
  tryLogin,
} from '../support/commands'

describe('Profile Management', () => {
  it('Should change the password and change it back', () => {
    cy.visit('/')
    login(cy, 'testuser@gmail.com', 'password')
    navigateFromUserMenu(cy, 'Profile')
    cy.get('.shade-tabs-header-container').contains('Change Password').scrollIntoView().click()

    cy.contains('Current password').find('input').clear().type('wrongCurrentPassword')
    cy.contains('New password').find('input').clear().type('newPassword')
    cy.contains('Confirm new password').find('input').clear().type('wrongNewPasswordConfirmation')
    cy.get('button').contains('Change password').click()
    expectAndDismissNotification(cy, 'The password and the password confirmation should be the same', 'warning')

    cy.contains('Confirm new password').find('input').clear().type('newPassword')
    cy.get('button').contains('Change password').click()
    expectAndDismissNotification(cy, "Current password doesn't match.", 'error')

    cy.contains('Current password').find('input').clear().type('password')
    cy.get('button').contains('Change password').click()
    expectAndDismissNotification(cy, 'Your password has been changed.', 'success')

    logoutFromUserMenu(cy)

    // Cannot login with old username / password
    tryLogin(cy, 'testuser@gmail.com', 'password')
    expectAndDismissNotification(cy, 'Please check your credentials', 'warning')

    login(cy, 'testuser@gmail.com', 'newPassword')
    navigateFromUserMenu(cy, 'Profile')
    cy.get('.shade-tabs-header-container').contains('Change Password').scrollIntoView().click()
    cy.contains('Current password').find('input').clear().type('newPassword')
    cy.contains('New password').find('input').clear().type('password')
    cy.contains('Confirm new password').find('input').clear().type('password')
    cy.get('button').contains('Change password').click()
    logoutFromUserMenu(cy)

    login(cy, 'testuser@gmail.com', 'password')
  })

  it('Should change the avatar image', () => {
    login(cy, 'testuser@gmail.com', 'password')
    navigateFromUserMenu(cy, 'Profile')
    cy.get('shade-profile-page multiverse-my-avatar').should('be.visible')

    cy.get('shade-profile-page input[type=file]').attachFile(
      { filePath: 'images/test-avatar.png', encoding: 'base64' },
      { force: true },
    )

    expectAndDismissNotification(cy, 'Your avatar has been updated', 'success')

    cy.get('shade-profile-page div.profileHeader').should('be.visible')
  })

  it('Should update the theme from the personal settings JSON', () => {
    const saveButtonSelector = 'user-settings-editor button[title="Save"]'

    login(cy, 'testuser@gmail.com', 'password')
    navigateFromUserMenu(cy, 'Profile')
    cy.get('shade-tabs div').contains('Personal settings', { matchCase: false }).scrollIntoView().click()
    cy.get('user-settings-editor').then((el) => {
      const editor: any = el[0]
      editor.props.setValue({ ...editor.props.currentValue, settings: { theme: 'light' } })
      editor.updateComponent()
    })
    // cy.wait(5000)
    cy.get(saveButtonSelector).should('be.visible').click()
    expectAndDismissNotification(cy, 'Your changes has been saved succesfully')

    cy.get('shade-app-bar > div').should('be.visible')
    navigateFromUserMenu(cy, 'Profile')
    cy.get('shade-tabs div').contains('Personal settings', { matchCase: false }).scrollIntoView().click()
    cy.get('user-settings-editor').then((el) => {
      const editor: any = el[0]
      editor.props.setValue({ ...editor.props.currentValue, settings: { theme: 'dark' } })
      editor.updateComponent()
    })
    // cy.wait(5000)
    cy.get(saveButtonSelector).click()
    expectAndDismissNotification(cy, 'Your changes has been saved succesfully')
    cy.get('shade-app-bar > div')
  })
})
