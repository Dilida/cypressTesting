// / <reference types="Cypress" />
import {
  confirmAPI, roundAmt, time2Date
} from '../../support/utility.js'

describe('个人中心-投注记录', () => {
  let betList;
  let pageUrl = '/betRecord';
  before(() => {
    cy.server();
    cy.route('GET','/order/v1/bet/list?page=*').as('betList');
    cy.route('GET','/order/v1/bet/today/getSummary').as('todayCount');
    cy.memberPage(pageUrl);
    cy.wait('@betList').then((response) => {
      betList = confirmAPI(response);
    });
  });
  beforeEach(() => {
    Cypress.Cookies.preserveOnce("username", "access_pcToken", "acType");
  });

  context('个人中心-投注记录', () => {

    it('个人中心-投注记录，今日统计数据比对', () => {
      cy.wait('@todayCount').then((response) => {
        let todayCount = confirmAPI(response);
        cy.get('.account-manage-info__item:nth-child(2)').contains(todayCount.sumBetAmount && todayCount.sumBetAmount !== 0 ? roundAmt(todayCount.sumBetAmount) : 0);
        cy.get('.account-manage-info__item:nth-child(3)').contains(todayCount.sumBetAmount && todayCount.sumPayoff !== 0 ? roundAmt(todayCount.sumPayoff) : 0);
        cy.get('.account-manage-info__item:nth-child(4)').contains(todayCount.sumBetAmount && todayCount.sumBetAmount !== 0 ? roundAmt(todayCount.sumBackAmount) : 0);
        cy.get('.account-manage-info__item:nth-child(5)').contains(todayCount.sumBetAmount && todayCount.profitAmount !== 0 ? roundAmt(todayCount.profitAmount) : 0);
      })
    })

    it('个人中心-投注记录，比对第一条资料，投注状态中奖为绿色，未中奖灰色', () => {
      if(betList.list.length) {
        cy.get('tbody > :nth-child(1) > :nth-child(1)').contains(betList.list[0].lotteryName); //彩种名称
        cy.get('tbody > :nth-child(1) > :nth-child(2)').contains(betList.list[0].issueAlias); //期号
        cy.get('tbody > :nth-child(1) > :nth-child(3)')
          .should('contain', betList.list[0].winNumber.split(',')[0] ? betList.list[0].winNumber.split(',')[0] : '--')
          .and('contain', betList.list[0].winNumber.split(',')[1] ? betList.list[0].winNumber.split(',')[1] : '')
          .and('contain', betList.list[0].winNumber.split(',')[2] ? betList.list[0].winNumber.split(',')[2] : '')
          .and('contain', betList.list[0].winNumber.split(',')[3] ? betList.list[0].winNumber.split(',')[3] : '')
          .and('contain', betList.list[0].winNumber.split(',')[4] ? betList.list[0].winNumber.split(',')[4] : '');
        cy.get('tbody > :nth-child(1) > :nth-child(4)').contains(betList.list[0].playName); //投注内容
        cy.get('tbody > :nth-child(1) > :nth-child(5)').contains(roundAmt(betList.list[0].betAmount)); //投注金额
        cy.get('tbody > :nth-child(1) > :nth-child(6)').contains(betList.list[0].backAmount ? roundAmt(betList.list[0].backAmount) : '--');//返点
        cy.get('tbody > :nth-child(1) > :nth-child(7)').contains(betList.list[0].payoff ? roundAmt(betList.list[0].payoff) : '--');//奖金
        cy.get('tbody > :nth-child(1) > :nth-child(8)')
          .should('contain', betList.list[0].orderStatusName)
          .and('have.class', betList.list[0].orderStatus == '32' ? 'text-positive' : 'text-tertiary' );
        cy.get('tbody > :nth-child(1) > :nth-child(9)').contains(time2Date(betList.list[0].betTime));//时间
      }
    })

    // it('个人中心-投注记录，筛选列点击类型，列表应只出现该状态', () => {
    //   cy.get('.table-header > :nth-child(3) > :nth-child(3)').click(); // 待删
    //   cy.get('.table-header > :nth-child(2) > :nth-child(3)').click();
    //   cy.get('tbody > :nth-child(1) > :nth-child(8)')
    //     .should('contain', '等待开奖')
    //     .and('have.class', 'text-tertiary' );

    //   cy.get('.table-header > :nth-child(2) > :nth-child(4)').click();
    //   cy.get('tbody > :nth-child(1) > :nth-child(8)')
    //     .should('contain', '已中奖')
    //     .and('have.class', 'text-positive' );

    //   cy.get('.table-header > :nth-child(2) > :nth-child(5)').click();
    //   cy.get('tbody > :nth-child(1) > :nth-child(8)')
    //     .should('contain', '未中奖')
    //     .and('have.class', 'text-tertiary' );
    // })

  })

})
