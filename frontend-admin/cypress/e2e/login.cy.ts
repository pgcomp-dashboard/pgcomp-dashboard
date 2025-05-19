enum SuccessMessages {
  LOGIN_SUCCESS = "Áreas e sub-áreas",
}

enum ErrorMessages {
  LOGIN_FAILED = "Email e/ou senha inválidos.",
  REQUIRED_FIELD = "Preencha todos os campos.",
  INVALID_EMAIL = "O campo email deve ser um endereço válido",
}

enum InvalidCredentials {
  EMAIL = "usuario@teste.com",
  INVALID_EMAIL = "usuarioteste.com",
  PASSWORD = "senha123",
}

describe("Fluxo de autenticação", () => {

  beforeEach(() => {
    cy.visit('/admin/areas') 
  })

  it("deve fazer login e exibir o dashboard", () => {
    const email = Cypress.env("admin_email");
    const password = Cypress.env("admin_password");

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[name="submitLoginForm"]').click();

    cy.url().should("include", "/admin");

    cy.contains(SuccessMessages.LOGIN_SUCCESS).should("be.visible");
  });
  it("Deve retornar erro ao inserir as credencias erradas", () => {

    cy.get('input[name="email"]').type(InvalidCredentials.EMAIL);
    cy.get('input[name="password"]').type(InvalidCredentials.PASSWORD);
    cy.get('button[name="submitLoginForm"]').click();

    cy.contains(ErrorMessages.LOGIN_FAILED).should("be.visible");
  });

  it("Deve indicar que exitem campos incompletos - todos", () => {

    cy.get('button[name="submitLoginForm"]').click();

    cy.contains(ErrorMessages.REQUIRED_FIELD).should("be.visible");
  });
  it("Deve indicar que exitem campos incompletos - email", () => {

    cy.get('input[name="password"]').type(InvalidCredentials.PASSWORD);
    cy.get('button[name="submitLoginForm"]').click();

    cy.contains(ErrorMessages.REQUIRED_FIELD).should("be.visible");
  });
  it("Deve indicar que exitem campos incompletos - senha", () => {

    cy.get('input[name="email"]').type(InvalidCredentials.EMAIL);
    cy.get('button[name="submitLoginForm"]').click();

    cy.contains(ErrorMessages.REQUIRED_FIELD).should("be.visible");
  });

  it("Deve indicar que a estrutura do email é inválida", () => {

    cy.get('input[name="email"]').type(InvalidCredentials.INVALID_EMAIL);
    cy.get('input[name="password"]').type(InvalidCredentials.PASSWORD);
    cy.get('button[name="submitLoginForm"]').click();

    cy.contains(ErrorMessages.INVALID_EMAIL).should("be.visible");
  });
});
