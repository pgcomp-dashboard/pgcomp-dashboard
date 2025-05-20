
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
  