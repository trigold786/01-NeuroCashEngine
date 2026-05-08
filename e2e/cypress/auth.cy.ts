describe('Authentication', () => {
  it('should display login page', () => {
    cy.visit('/');
    cy.contains('NeuroCashEngine').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.visit('/');
    cy.contains('立即注册').click();
    cy.contains('已有账号？').should('be.visible');
  });
});