describe("Example Application", () => {
  it("Login and logout roundtrip", () => {
    cy.log("Visiting Home...");
    cy.visit("/");
    cy.log("Checking Login form...");
    cy.get("shade-login>div>form").should("be.visible");
    cy.get("shade-login input[type=text]")
      .should("be.visible")
      .should("be.enabled");
    cy.get("shade-login input[type=text]")
      .type("testuser")
      .blur();
    cy.get("shade-login input[type=password]")
      .should("be.visible")
      .should("be.enabled");
    cy.get("shade-login input[type=password]")
      .type("password")
      .blur();
    cy.get("shade-login button").should("be.visible");
    cy.log("Logging in...");
    cy.get("shade-login button").click();

    cy.get("shade-login shade-loader").should("be.visible");
    cy.log("Checking Welcome screen...");
    cy.get("hello-world div h2").should("be.visible");
    cy.get("hello-world div h2").contains("Hello, testuser !");

    cy.log("Logging out...");
    cy.get("hello-world button").should("be.visible");
    cy.get("hello-world button").click();

    cy.log("Checking Login form...");
    cy.log("Checking Login form...");
    cy.get("shade-login>div>form").should("be.visible");
    cy.get("shade-login input[type=text]").should("be.visible");
    cy.get("shade-login input[type=password]").should("be.visible");
  });
});
