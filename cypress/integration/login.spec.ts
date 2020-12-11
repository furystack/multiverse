import { expectAndDismissNotification, logoutFromUserMenu } from '../support/commands'

describe('Core Application', () => {
  const headerSelector = 'shade-app-header>shade-app-bar>div'
  const loginFormSelector = 'shade-login>div>div>form'
  const usernameInputSelector = 'shade-login input[type=text][title=username]'
  const passwordFieldSelector = 'shade-login input[type=password]'
  const loginButtonSelector = 'shade-login button[type=submit]'
  const loginErrorSelector = 'shade-login div.login-error'

  describe('Login with username / password', () => {
    it('Should show proper error message for invalid credentials', () => {
      cy.visit('/')
      cy.get(usernameInputSelector).type('wrongUser:(').blur()
      cy.get(passwordFieldSelector).type('wrongPassword').blur()
      cy.get(loginButtonSelector).click()
      expectAndDismissNotification(cy, 'Please check your credentials', 'warning')
      cy.get(loginErrorSelector).should('be.visible').contains('Login Failed')
    })

    it('Should redirect to Accept Terms when not accepted', () => {
      cy.visit('/')
      cy.get(usernameInputSelector).type('testTermsNotAcceptedUser@gmail.com').blur()
      cy.get(passwordFieldSelector).type('password').blur()
      cy.get(loginButtonSelector).click()
      cy.get('welcome-page multiverse-dashboard > div').should('not.exist')

      cy.get('accept-terms-page')
        .should('be.visible')
        .within(() => {
          cy.contains('accept').scrollIntoView().click()
        })
      expectAndDismissNotification(cy, 'You have accepted the terms', 'success')
      cy.get('welcome-page multiverse-dashboard > div').should('be.visible')
    })

    it.only('Login and logout roundtrip', () => {
      cy.visit('/')
      cy.get(loginFormSelector).should('be.visible')
      cy.get(usernameInputSelector).focus()
      cy.get(loginFormSelector).toMatchImageSnapshot({ threshold: 0.001 })

      cy.get(headerSelector).toMatchImageSnapshot({ threshold: 0.001 }) // with no avatar
      cy.get(usernameInputSelector).should('be.visible').should('be.enabled')
      cy.get(usernameInputSelector).type('testuser@gmail.com').blur()
      cy.get(passwordFieldSelector).should('be.visible').should('be.enabled')
      cy.get(passwordFieldSelector).type('password').blur()
      cy.get(loginButtonSelector).should('be.visible')
      cy.get(loginButtonSelector).click()

      expectAndDismissNotification(cy, 'Welcome back ;)', 'success')

      cy.get('welcome-page multiverse-dashboard > div').should('be.visible')

      cy.get(headerSelector).should('be.visible').toMatchImageSnapshot({ threshold: 0.001 }) // with avatar and menu
      logoutFromUserMenu(cy)

      cy.get(loginFormSelector).should('be.visible')
      cy.get(usernameInputSelector).should('be.visible').should('be.empty')
      cy.get(passwordFieldSelector).should('be.visible').should('be.empty')
    })
  })

  describe('Login with Github', () => {
    const githubLoginButtonSelector = 'shade-button button[title=Github]'

    it('Should display a proper error message for wrong code', () => {
      cy.visit('/')
      cy.get(githubLoginButtonSelector).should('be.visible').should('be.enabled')
      cy.visit('/github-login?code=123456')
      cy.get('button').should('be.visible').should('be.enabled')
      cy.get('shade-github-login').contains('There was an error during Github login')
    })

    it.skip('Log in and log out roundtrip', () => {
      cy.server()
      cy.route('POST', 'http://localhost:9090/users/githubLogin', { username: 'testuser@gmail.com' }).as(
        'ghLoginRequest',
      )
      cy.visit('/github-login?code=123456')
      cy.wait('@ghLoginRequest')

      cy.get('shade-current-user-menu').should('be.visible')
      cy.get('shade-current-user-menu').click()
      cy.get('shade-current-user-menu Button[title=logout]').click()
      cy.get(loginFormSelector).should('be.visible')
    })
  })

  describe('Login with Google', () => {
    const googleLoginButtonSelector = 'shade-button button[title=Google]'
    it('Should display a correct error message on invalid login', () => {
      cy.visit('/')
      cy.get(googleLoginButtonSelector).should('be.visible').should('be.enabled').click()
    })
    it.skip('Log in and logout roundtrip', () => {
      /** */
    })
  })
})
