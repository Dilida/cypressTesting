// / <reference types="Cypress" />
import {
  confirmAPI, roundAmt, time2Date
} from '../../support/utility.js'

describe('个人中心-账户明细', () => {
  let accountInfo;
  let pageUrl = '/member/accountInfo';
  before(() => {
    cy.server();
    cy.route('GET','/payment/v1/member/trade/list?searchType=*').as('accountInfo');
    cy.memberPage(pageUrl);
    cy.wait('@accountInfo').then((response) => {
      accountInfo = confirmAPI(response);
    });
  });
  beforeEach(() => {
    Cypress.Cookies.preserveOnce("username", "access_pcToken", "acType");
  });

  context('个人中心-账户明细', () => {

    it('个人中心-账户明细，今日统计数据比对', () => {
      if(accountInfo.list.length) {
        cy.get('tbody > :nth-child(1)')
          .should('contain', accountInfo.list[0].orderNo)
          .and('contain', accountInfo.list[0].tradeTypeName)
          .and('contain', roundAmt(accountInfo.list[0].tradeAmount))
          .and('contain', accountInfo.list[0].balance ? roundAmt(accountInfo.list[0].balance) : '--')
          .and('contain', accountInfo.list[0].statusName)
          .and('contain', time2Date(accountInfo.list[0].createTime))
      }
    })

  })

})
