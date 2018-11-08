// / <reference types="Cypress" />

describe("railway", () => {
  before(() => {
    cy.visit("http://railway.hinet.net/Foreign/TW/etno_roundtrip.html");
  });

  it("test", () => {
    cy.get("#person_id").type("U221181751");
    cy.get("#from_station").select("103");
    cy.get("#to_station").select("034");
    cy.get("#getin_date").select("2018/11/23-14");
    cy.get("#train_no").type("432");
    cy.get("#getin_date2").select("2018/11/24-15");
    cy.get("#train_no2").type("431");
    cy.get(".btn").click();
    // //pic
    // cy.get("#idRandomPic").invoke('attr','src').then(($el) => {
    //     cy.wrap(null).then(() => {
    //         return cy.railwayCode(`http://railway.hinet.net/${$el}/ImageOut.jpg`).then((response)=> {
    //             console.log(response);
    //             cy.get('#randInput').type(response);
    //         })
    //     })
    // });

    });
});
