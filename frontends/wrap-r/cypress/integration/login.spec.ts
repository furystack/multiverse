describe('Wrap-R Application', () => {
  const headerSelector = 'shade-app-header'
  const loginFormSelector = 'shade-login>div>div>form'
  const usernameInputSelector = 'shade-login input[type=text][title=username]'
  const passwordFieldSelector = 'shade-login input[type=password]'
  const loginButtonSelector = 'shade-login button[type=submit]'
  const loginErrorSelector = 'shade-login div.login-error'

  describe('Login with username / password', () => {
    it('Should show proper error message for invalid credentials', () => {
      cy.visit('/')
      cy.get(usernameInputSelector)
        .type('wrongUser:(')
        .blur()
      cy.get(passwordFieldSelector)
        .type('wrongPassword')
        .blur()
      cy.get(loginButtonSelector).click()
      cy.get(loginErrorSelector)
        .should('be.visible')
        .contains('Login failed')
    })

    it('Login and logout roundtrip', () => {
      cy.visit('/')
      cy.log('Checking Login form...')
      cy.get(loginFormSelector).should('be.visible')
      cy.get(usernameInputSelector).focus()
      cy.get(loginFormSelector).toMatchImageSnapshot()

      cy.get(headerSelector).toMatchImageSnapshot() // with no avatar
      cy.get(usernameInputSelector)
        .should('be.visible')
        .should('be.enabled')
      cy.get(usernameInputSelector)
        .type('testuser')
        .blur()
      cy.get(passwordFieldSelector)
        .should('be.visible')
        .should('be.enabled')
      cy.get(passwordFieldSelector)
        .type('password')
        .blur()
      cy.get(loginButtonSelector).should('be.visible')
      cy.log('Logging in...')
      cy.get(loginButtonSelector).click()

      cy.get('shade-login shade-loader div').should('be.visible')
      cy.log('Checking Welcome screen...')
      cy.get('welcome-page div h2').should('be.visible')
      cy.get('welcome-page div h2').contains('Hello, testuser !')

      cy.get(headerSelector).toMatchImageSnapshot({ threshold: 0.001 }) // with avatar and menu
      cy.get('shade-current-user-menu').click()
      cy.get('shade-current-user-menu Button[title=logout]').click()

      cy.log('Logging out...')
      cy.log('Checking Login form...')
      cy.get(loginFormSelector).should('be.visible')
      cy.get(usernameInputSelector)
        .should('be.visible')
        .should('be.empty')
      cy.get(passwordFieldSelector)
        .should('be.visible')
        .should('be.empty')
    })
  })

  describe('Login with Github', () => {
    const githubLoginButtonSelector = 'shade-button button[title=Github]'

    it('Should display a proper error message for wrong code', () => {
      cy.visit('/')
      cy.get(githubLoginButtonSelector)
        .should('be.visible')
        .should('be.enabled')
      cy.visit('/github-login?code=123456')
      cy.get('button')
        .should('be.visible')
        .should('be.enabled')
      cy.get('shade-github-login').contains('There was an error during Github login')
    })

    it.skip('Log in and log out roundtrip', () => {
      cy.server()
      cy.route('POST', 'http://localhost:9090/users/githubLogin', { username: 'testuser' }).as('ghLoginRequest')
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
      cy.get(googleLoginButtonSelector)
        .should('be.visible')
        .should('be.enabled')
        .click()
    })
    it.skip('Log in and logout roundtrip', () => {
      /** */
    })
  })
})
