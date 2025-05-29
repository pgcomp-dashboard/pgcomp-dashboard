describe('Fluxo de criação de area', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('deve fazer login, criar e excluir uma area', () => {
    const areaName = 'testCreateNewArea';
 

    const password = Cypress.env('admin_password');
    const adminEmail = Cypress.env('admin_email');

    const dropdownSelector = `[data-cy="area-list-dropdown-${areaName}"]`;
    const deleteSelector = `[data-cy="area-list-dropdown-delete-${areaName}"]`;
    const confirmDeleteSelector = '[data-cy="area-list-dropdown-delete-modal-confirm-button"]';

    cy.login(adminEmail, password);

    cy.get('[data-cy="link-areas"]').click();
    cy.get('[data-cy="add-area-button"]').click();

    cy.get('[data-cy="add-area-form-input-name"]').type(areaName);
    cy.get('[data-cy="add-area-form-input-student-number"]').clear().type('9');

    
    cy.get('[data-cy="add-area-form-submit"]').click();

    cy.contains(areaName).should('be.visible');

    cy.get(dropdownSelector).click();
    cy.get(deleteSelector).click();
    cy.get(confirmDeleteSelector).click();

    cy.contains(areaName).should('not.exist');
  });
});
