enum SuccessMessages {
  LOGIN_SUCCESS = 'Áreas e sub-áreas',
}

enum ErrorMessages {
  LOGIN_FAILED = 'Credenciais inválidas!',
  REQUIRED_FIELD_EMAIL = 'Email inválido!',
  REQUIRED_FIELD_PASSWORD = 'Senha muito curta!',
  INVALID_EMAIL = 'Email inválido!',
}

enum InvalidCredentials {
  EMAIL = 'usuario@teste.com',
  INVALID_EMAIL = 'usuarioteste.com',
  PASSWORD = 'senha123',
}

describe('Fluxo de autenticação', () => {

  beforeEach(() => {
    cy.visit('/login'); 
  });

  it('deve fazer login e exibir o dashboard', () => {
    const email = Cypress.env('admin_email');
    const password = Cypress.env('admin_password');

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.location('pathname').should('eq', '/admin/areas');

  });
  it('Deve retornar erro ao inserir as credencias erradas', () => {

    cy.get('input[name="email"]').type(InvalidCredentials.EMAIL);
    cy.get('input[name="password"]').type(InvalidCredentials.PASSWORD);
    cy.get('button[type="submit"]').click();

    cy.contains(ErrorMessages.LOGIN_FAILED).should('be.visible');
  });

  it('Deve indicar que exitem campos incompletos - todos', () => {

    cy.get('button[type="submit"]').click();

    cy.contains(ErrorMessages.REQUIRED_FIELD_EMAIL).should('be.visible');
    cy.contains(ErrorMessages.REQUIRED_FIELD_PASSWORD).should('be.visible');
  });
  it('Deve indicar que exitem campos incompletos - email', () => {

    cy.get('input[name="password"]').type(InvalidCredentials.PASSWORD);
    cy.get('button[type="submit"]').click();

    cy.contains(ErrorMessages.REQUIRED_FIELD_EMAIL).should('be.visible');
  });
  it('Deve indicar que exitem campos incompletos - senha', () => {

    cy.get('input[name="email"]').type(InvalidCredentials.EMAIL);
    cy.get('button[type="submit"]').click();

    cy.contains(ErrorMessages.REQUIRED_FIELD_PASSWORD).should('be.visible');
  });

  it('Deve indicar que a estrutura do email é inválida', () => {

    cy.get('input[name="email"]').type(InvalidCredentials.INVALID_EMAIL);
    cy.get('input[name="password"]').type(InvalidCredentials.PASSWORD);
    cy.get('button[type="submit"]').click();

    cy.contains(ErrorMessages.INVALID_EMAIL).should('be.visible');
  });
});
