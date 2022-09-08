import faker from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };
    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/register");

    cy.findByTestId(/email/i).type(loginForm.email);
    cy.findByTestId(/password/i).type(loginForm.password);
    cy.findByTestId(/acceptTerms/i).click();
    cy.findByTestId("submit").click();

    cy.location("pathname").should("eq", "/");
  });
});
