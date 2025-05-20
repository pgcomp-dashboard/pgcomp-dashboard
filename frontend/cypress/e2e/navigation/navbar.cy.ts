const navbarLabels = [
  "Produções científicas",
  "Produções por qualis",
  "Alunos por docente",
  "Alunos por área",
  "Defesas por ano",
  "Matrículas por ano"
];
describe("", () => {
  beforeEach(() => {
    cy.visit('/') 
  })
  it("Barra de navegação renderizando", () => {
    navbarLabels.map((el) => {
      cy.get('#nav_desktop').contains(el).should("be.visible");
    });
  });
});
