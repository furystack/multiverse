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

  it('Should create and browse a Movie Library', () => {
    cy.visit('/')
    login(cy, 'testMovieAdmin@gmail.com', 'password')
    navigateFromUserMenu(cy, 'Movies')
    cy.get('shade-fab div[title="Create new movie library"]').click()
    cy.get('label').contains('Name').find('input').clear().type('ExampleMovieLib')
    cy.get('label').contains('Path').find('input').clear().type('/tmp')
    cy.get('label').contains('Icon').find('input').clear().type('🧪')
    cy.get('button').contains('Create Movie Library').click()

    navigateFromUserMenu(cy, 'Movies')
    cy.get('div').contains('ExampleMovieLib').should('be.visible')
  })

  it.skip('Should watch movie libs for organization members')
})
