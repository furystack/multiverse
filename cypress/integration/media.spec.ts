import { login, navigateFromUserMenu, openUserMenu } from '../support/commands'

describe('Movies', () => {
  it('Should be available from the User menu', () => {
    cy.visit('/')
    login(cy, 'testuser@gmail.com', 'password')
    cy.get('welcome-page').contains('Movies').scrollIntoView().click()
    cy.get('multiverse-library-list').should('be.visible')
  })

  it('Should be available from the User menu', () => {
    cy.visit('/')
    login(cy, 'testuser@gmail.com', 'password')
    navigateFromUserMenu(cy, 'Movies')
    cy.get('multiverse-library-list').should('be.visible')
  })

  it.skip('Should create and browse a Movie Library', () => {
    cy.visit('/')
    login(cy, 'testMovieAdmin@gmail.com', 'password')
    navigateFromUserMenu(cy, 'Movies')
    cy.get('[title="Create new movie library"]').click()
  })

  it.skip('Should watch movie libs for organization members')
})
