// / <reference types="Cypress" />
import {
  confirmAPI, roundAmt
} from '../../support/utility.js'

describe('首頁header 試玩登入/ user登入', () => {
  context('首頁header試玩/logo欄位', () => {
    let code, site;
    before(() => {
      cy.server();
      cy.route('GET','/cms/v1/site').as('site');
      cy.route('GET','/member/v1/code').as('code');
      cy.visitPage();
      cy.wait('@site').then((response) => {
        site = confirmAPI(response);
      })
    });
    it('首页上方登入，输入正确后显示登录状态，且验证余额是否正确，且可正常登出/ 首页上方登入后，点选会员帐号，可登出', () => {
      cy.server();
      cy.route('POST','/member/v1/login').as('userLogin');
      cy.route('GET', '/cms/v1/popText').as('popup');
      cy.route('POST','/member/v1/logout').as('userLogout');
      // login start
      cy.wait('@code').then((response) => {
        code = confirmAPI(response);
        cy.wrap(null).then(() => {
          return cy.ocrCode(code.code).then((response)=> {
            cy.get('.q-list > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(response? response: 1111);
            cy.get('.q-list > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(Cypress.env("loginAccount"));
            cy.get('.q-list > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(Cypress.env("loginPW"));
            cy.get(':nth-child(4) > .btn-primary').click().end()
          })
        })
      })

      // login end

      cy.wait('@userLogin').then((response)=>{
        const {apistatus, result} = response.response.body;
        if( apistatus === 1){
          expect(apistatus).to.eq(1);
          assert.isObject(result);
          const memberBalance = roundAmt(result.balance);
          cy.get('.user-name > .q-btn > .q-btn-inner > div')
            .should('be.visible').and('contain', result.username);
          cy.wait('@popup').then((response) => {
            cy.get('.modal--lobbypop').then(() => {
              const {apistatus, result} = response.response.body;
              expect(apistatus).to.eq(1);
              assert.isObject(result);
              cy.get('.modal--lobbypop > .modal-content').contains(result.list[0].title);
              cy.get('.modal--lobbypop > .modal-content > .modal__header > .q-btn > .q-btn-inner > .q-icon').click();
              cy.wait(500);
              // 验证余额
              cy.get('.q-list > :nth-child(2) > .user-purse > .user-purse__balance > .q-btn > .q-btn-inner')
                .contains('显示')
                .click()
                .get('.q-list > :nth-child(2) > .user-purse > .user-purse__balance > .user-purse-amt')
                .contains(memberBalance)
                .end();

              //登出流程
              cy.get('.user-name > .q-btn > .q-btn-inner > div').click()
                .get('.q-popover > .q-btn > .q-btn-inner').contains('登出').click().end();
              cy.wait('@userLogout').then((response) => {
                const {apistatus, result} = response.response.body;
                expect(apistatus).to.eq(1);
                assert.isBoolean(result);
                cy.get('.login-bar')
                .should('contain', '登录')
                .should('contain', '注册')
                .should('contain', '试玩').end();
              })
            })
          })
        } else {
          cy.wait(500).get('.modal-content')
            .contains('.modal__footer','关闭' )
            .find('.q-btn')
            .click().end();
        }
      })

    })
    it('点选免费注册后，要导向注册页', () => {
      cy.get('.btn-reg > .q-btn-inner').contains('免费注册').click()
        .location('href').should('include', '/reg').go(-1);
    })
    it('logo顯示/title顯示', () => {
      cy.get('.brand-logo').invoke('attr','src').should('include', site.logoPic)
      cy.title().should('eq', site.name);
    })
    it('登入欄位/試玩登入/試玩登出', () => {
      cy.server();
      cy.route('POST','/member/v1/login/test').as('demoLogin');
      cy.route('POST','/member/v1/logout').as('demoLogout');
      //驗證登入欄位
      cy.get('.login-bar')
      .should('contain', '登录')
      .should('contain', '注册')
      .should('contain', '试玩')
      //驗證試玩登入
      cy.get('.btn-demoplay > .q-btn-inner').click();
      cy.wait('@demoLogin')
        .then((response) => {
          const {apistatus, result} = response.response.body;
          expect(apistatus).to.eq(1);
          assert.isObject(result);
          cy.get('.user-name > .q-btn > .q-btn-inner > div')
          .should('be.visible').and('contain', result.username);
        })
      //驗證試玩登出
      cy.wait(500);
      cy.get('.user-name > .q-btn > .q-btn-inner > div').click()
        .get('.q-popover').should('be.visible') //彈跳視窗確認
      cy.get('.q-popover > .q-btn > .q-btn-inner').contains('登出').click()
      cy.wait('@demoLogout')
        .then((response) => {
          const {apistatus, result} = response.response.body;
          expect(apistatus).to.eq(1);
          cy.get('.login-bar')
            .should('contain', '登录')
            .should('contain', '注册')
            .should('contain', '试玩')
        }).end()
    })
  })

})
