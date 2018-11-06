// / <reference types="Cypress" />
import '../../support/commands.mobile';
import {
  confirmAPI
} from '../../support/mobileUtility.js'

describe('进入登入页后，完成登入/登出', () => {
  let code;
  before( ()=> {
    cy.server();
    cy.route('/uaa/apid/member/code/get?time=*').as('code');
    cy.route('POST', '/uaa/apid/member/login').as('userLogin');

    cy.visit('/login');
    cy.wait('@code').then((response) => {
      code = confirmAPI(response);
    })
  })
  it('userLogin', () => {
    cy.server();
    cy.route('/forseti/apid/cms/popText').as('popText');
    cy.route('GET', '/uaa/oauth/logout').as('logOut');
    // login start
    const body = {
      "apiKey":"d4bcc79d9888957",
      "base64Image":`data:image/png;base64,${code.code}`,
    }
    cy.request({
      method: 'POST',
      url: 'https://api.ocr.space/parse/image',
      form: true,
      body,
    }).then((res) => {
      const codeText= res.body.ParsedResults[0].ParsedText.replace(/[a-zA-Z]|[\s]/g, '');
      cy.get(':nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(Cypress.env("loginAccount"));
      cy.get(':nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(Cypress.env("loginPW"));
      cy.get(':nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(codeText? codeText: 1111);
      cy.get(':nth-child(5) > .q-btn > .q-btn-inner').should('contain', '登录').click();
    // login end
    });
    cy.wait('@userLogin').then((response)=>{
      const {code} = response.response.body;
      if(code === 105){
        cy.get('.modal-content').should('contain', '验证码无效');
      } else {
        cy.get('.modal-content').should('contain', '登录成功');

        //logout start
        cy.wait('@popText').then((response) => {
          const {data} = response.response.body;
          if(data.length > 0){
            cy.get('.dialog-content').contains(data[0].content)
              .get('.dialog-header > .q-btn').click().end();
          }
        cy.logout();
        })

      }
    })
  });
})

describe('首頁header 試玩登入', () => {
  before(() => {
    cy.visitPage();
  });

  it('点选首页「试玩」后，完成游客登入/登出', () => {
    cy.server();
    cy.route('POST', '/uaa/apid/member/testLogin').as('testLogin');
    cy.route('GET', '/uaa/oauth/logout').as('logOut');
    cy.demoLogin();
    cy.logout();
  });


});
