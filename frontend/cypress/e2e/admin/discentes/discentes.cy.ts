describe('Fluxo de criação de discente', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('deve fazer login, criar e excluir um discente', () => {
    const nome = 'João da Silva';
    const email = 'joao@example.com';
    const lattesUrl = 'http://lattes.cnpq.br/joao';
    const areaId = '1';
    const courseId = '2';
    const defendedAt = '2025-12-15';

    const password = Cypress.env('admin_password');
    const adminEmail = Cypress.env('admin_email');

    const dropdownSelector = `[data-cy="student-list-dropdown-${nome}"]`;
    const deleteSelector = `[data-cy="student-list-dropdown-delete-${nome}"]`;
    const confirmDeleteSelector = '[data-cy="student-list-dropdown-delete-modal-confirm-button"]';

    cy.login(adminEmail, password);

    cy.get('[data-cy="link-discentes"]').click();
    cy.get('[data-cy="add-student-button"]').click();

    cy.get('[data-cy="add-student-form"]').within(() => {
      cy.get('#name').type(nome);
      cy.get('#email').type(email);
      cy.get('#area_id').clear().type(areaId);
      cy.get('#course_id').clear().type(courseId);
      cy.get('#lattes_url').type(lattesUrl);
      cy.get('#defended_at').type(defendedAt);
    });

    cy.get('[data-cy="add-student-form-submit"]').click();

    cy.contains(email).should('be.visible');

    cy.get(dropdownSelector).click();
    cy.get(deleteSelector).click();
    cy.get(confirmDeleteSelector).click();

    cy.contains(email).should('not.exist');
  });
});
