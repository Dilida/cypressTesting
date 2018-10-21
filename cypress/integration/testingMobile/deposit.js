// / <reference types="Cypress" />
context('Mobile Deposit', () => {
  Cypress.Cookies.debug(true);
  before(() => {
    cy.server();
    // cy.viewport('iphone-6');
    cy.visit('http://blc.baochi888.com/pc');
    // 临时token写入方法
    const userToken = {
      access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzY5ODEwMzksInVzZXJfbmFtZSI6InNzY3xtYW5keSIsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJqdGkiOiI4MTA1YTU0Zi0wNDUzLTQwNDEtYmE0Ny0yYzVhMTYzNDgxYmIiLCJjbGllbnRfaWQiOiJ3ZWJfYXBwIiwic2NvcGUiOlsib3BlbmlkIl19.dXruPsjMTV0CRe-C2DOdtGV_bHe4cVvGyFOIK7mvaS981mACALW5NsIkMt7A5-plvIjTrkh2R2Eo2v8L7kBGToEcsvX9Lx0J7M7AsO-6tNdd0lSj4X7J-D8c2kUbMwQwyeJsZFYb4Xm4eVvXSxWYtp_k699E_Q4Odexr2hNjZ0ImAgLGAlc3GXFET35DXEPUGS2U5b1sBacjBNXEnaSqTBkRIVtyKKqKDAdy7LtSRO7XrYm-JSPNF_h_UOt9T9yb4H6T1Iqd6b85uXCo2lmPeacl3ay1XNXwNzAAvM4VlIfDpz97WQWP3vRy-xlDL1HGEb4AoOpqmo4mElL4PT9Ktg',
      acType: '1',
      username: 'Mandy',
    };
    const pcToken = {
      access_token: 'MAuth-1de3d07e327f8f413bc2b42c2d821efbeb1c07666e1c60a719791c088100e5fb4917cf6db807494f1bf652f0e5a4d472-MAuth',
      loginTime: '1536894959766',
      username: 'mandy',
    };
    Cypress._.keys(pcToken).forEach((key) => {
      cy.setCookie(key, userToken[key]);
    })
  });
  beforeEach(() => {
      // 保留cookies
    Cypress.Cookies.preserveOnce("username", "access_token", "acType");
  });

  // 银行转帐自动加 乱数2位小数 CAIPIAOH5-2022
  it('check 银行转帐 输入金额自动加2位小数', () => {
    cy.visit('http://www.kingbaytest.com:8081/personal/deposit');
    cy.get('.modal-header > .q-btn > .q-btn-inner > .q-icon').click();
    cy.get('.q-if-inner > .col').type(100);
    cy.contains('银行转账').click();
    cy.get(':nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type('黄黄黄');
    cy.pause();
    cy.get(':nth-child(5) > .q-btn > .q-btn-inner').click();
    cy.get('.modal-header > .q-btn > .q-btn-inner > .q-icon').click();
    cy.pause();
    // TODO: 手动选择存款方式 / 求自动选择方法
  });

  return;
});
