describe('Wrap-R Application', () => {
  it('Login and logout roundtrip', () => {
    const loginFormSelector = 'shade-login>div>div>form'
    const usernameInputSelector = 'shade-login input[type=text][title=username]'
    const passwordFieldSelector = 'shade-login input[type=password]'
    const loginButtonSelector = 'shade-login button[type=submit]'

    cy.log('Visiting Home...')
    cy.visit('/')
    cy.log('Checking Login form...')
    cy.get(loginFormSelector).should('be.visible')
    cy.get(usernameInputSelector).focus()
    cy.get(loginFormSelector).toMatchImageSnapshot({
      threshold: 0.001,
    })
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
    cy.get('hello-world div h2').should('be.visible')
    cy.get('hello-world div h2').contains('Hello, testuser !')

    cy.log('Logging out...')
    cy.get('hello-world button').should('be.visible')
    cy.get('hello-world button').click()

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
