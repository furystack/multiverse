import { v4 } from 'uuid'

describe('Sign up', () => {
  it('Should alert if the password and the confirm password is different', (done) => {
    cy.on('window:alert', () => {
      done()
    })
    cy.visit('/')
    cy.contains('Sign up').click()
    // ToDO: History API
    cy.get('input[required][title=E-mail]').should('be.visible').type('alma@gmail.com').blur()
    cy.get('input[required][title=Password]').should('be.visible').type('asdasd').blur()
    cy.get('input[required][title="Confirm password"]').should('be.visible').type('89715264').blur()
    cy.get('button[title=Register]').click()
    cy.get('register-page > div > div').compareSnapshot('register-view', 0.001)
  })

  it('Should log in a registered user', () => {
    cy.visit('/').contains('Sign up').click()

    cy.get('input[required][title=E-mail]').should('be.visible').type(`${v4()}@testusers.com`)
    cy.get('input[required][title=Password]').should('be.visible').type('asdasd123')
    cy.get('input[required][title="Confirm password"]').should('be.visible').type('asdasd123')
    cy.get('button[title=Register]').click()
    cy.get('shade-current-user-menu').click()
    cy.get('shade-current-user-menu a[title="Log out"]').click()
    cy.get('shade-login>div>div>form').should('be.visible')
  })

  it('Should fail when try to re-register an already registered user', () => {
    cy.visit('/').contains('Sign up').click()

    cy.get('input[required][title=E-mail]').should('be.visible').type('testuser@gmail.com')
    cy.get('input[required][title=Password]').should('be.visible').type('asdasd123')
    cy.get('input[required][title="Confirm password"]').should('be.visible').type('asdasd123')
    cy.get('button[title=Register]').click()
    cy.contains('Failed to sign up').should('be.visible')
  })
})
