Cypress.Commands.add('login', (user, pass) => {
    cy.visit('/login')
    cy.get('input[name=username]').type(user)
    cy.get('input[name=password]').type(pass)
    cy.get('button[type=submit]').click()
  })
  