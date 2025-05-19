const navbarLabels = [
  "Produções científicas",
  "Produções por qualis",
  "Alunos por docente",
  "Alunos por área",
  "Alunos por sub-área",
];
const graphLabels = [
  "Produções científicas",
  "Produções por qualis",
  "Quantidade de Alunos por Orientador",
  "Alunos por área",
  "Alunos por sub-área",
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
