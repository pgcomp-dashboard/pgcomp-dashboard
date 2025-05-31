
describe('', () => {
  beforeEach(() => {
    cy.visit('/not_exists_page'); 
  });
  it('Deve retornar para raiz ao acessar página que não existe', () => {
    cy.location('pathname').should('eq', '/');
  });
});
