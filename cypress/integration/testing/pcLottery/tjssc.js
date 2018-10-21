// / <reference types="Cypress" />

describe('天津時時彩，試玩登入流程', () => {
  context('首頁header試玩/logo欄位', () => {
    before(() => {
      cy.server();
      cy.route('POST','/member/v1/login/test').as('demoLogin');
      cy.visitPage();
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
        .visit('/pc/lottery/ssc/tjssc')
        .getCookie('lotteryId').should('have.property','value', '12')
        .get('body').should('be.visible');

    });

    beforeEach( ()=> {
      Cypress.Cookies.preserveOnce("username", "access_pcToken", "acType");
    })
    it('接到天津時時彩api，預期logo圖和倒數時間計算', () => {
      cy.server();
      cy.route('POST','/member/v1/login/test').as('demoLogin');
    })
  })

})