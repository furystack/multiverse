describe('Sign up', () => {
  it('Should be available from the home page', () => {
    cy.visit('/')
    cy.contains('Sign up').click()
    // ToDO: History API
    // cy.get('register-page').toMatchImageSnapshot()
  })
})
