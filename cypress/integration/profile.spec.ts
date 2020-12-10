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

  it('Should change the avatar image', () => {
    login(cy, 'testuser@gmail.com', 'password')
    navigateFromUserMenu(cy, 'Profile')
    cy.get('shade-profile-page multiverse-my-avatar').should('be.visible')

    cy.get('shade-profile-page input[type=file]').attachFile(
      { filePath: 'images/test-avatar.png', encoding: 'base64' },
      { force: true },
    )

    cy.get('shade-profile-page multiverse-my-avatar').toMatchImageSnapshot()
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

    cy.get('shade-app-bar > div').should('be.visible').toMatchImageSnapshot()
    navigateFromUserMenu(cy, 'Profile')
    cy.get('shade-tabs div').contains('Personal settings', { matchCase: false }).scrollIntoView().click()
    cy.get('user-settings-editor').then((el) => {
      const editor: any = el[0]
      editor.props.setValue({ ...editor.props.currentValue, settings: { theme: 'dark' } })
      editor.updateComponent()
    })
    // cy.wait(5000)
    cy.get(saveButtonSelector).click()

    cy.get('shade-app-bar > div').toMatchImageSnapshot()
  })
})
