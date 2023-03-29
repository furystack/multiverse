import { getRandomString } from '@common/models'
import { expectAndDismissNotification } from '../support/commands'

const fillLoginForm = (email: string, password: string, confirmPassword = password) => {
  cy.get('input[required][title=E-mail]').should('be.visible').type(email)
  cy.get('input[required][title=Password]').should('be.visible').type(password)
  cy.get('input[required][title="Confirm password"]').should('be.visible').type(confirmPassword)
}

describe('Sign up', () => {
  it('Should alert if the password and the confirm password is different', () => {
    cy.visit('/')
    cy.contains('Sign up').click()

    fillLoginForm('alma@gmail.com', 'asdasd', 'asdasd123')

    cy.get('button[title=Register]').click()

    cy.contains('Passwords do not match')
    cy.contains('Sign up')
  })

  it('Should log in after a succesful registration', () => {
    cy.visit('/').contains('Sign up').click()

    fillLoginForm(`testRegistration-${getRandomString()}@testusers.com`, 'asdasd123')

    cy.get('button[title=Register]').click()
    cy.get('button').contains('Accept').click()
    expectAndDismissNotification(cy, 'You have accepted the terms')
    cy.get('shade-current-user-menu').click()
    cy.get('shade-current-user-menu a[title="Log out"]').click()
    cy.get('form.login-form').should('be.visible')
  })

  it('Should fail when try to re-register an already registered user', () => {
    cy.visit('/').contains('Sign up').click()

    fillLoginForm('testuser@gmail.com', 'asdasd123')

    cy.get('button[title=Register]').click()
    cy.contains('Failed to sign up').should('be.visible')
  })
})
