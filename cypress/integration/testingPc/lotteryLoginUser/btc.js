// / <reference types="Cypress" />
import {
  openLotteryPage,
} from '../../../support/utility.js'

describe('比特币彩投注页面投注验证', () => {
  const lotteryId = 48;
  const lotteryPage = openLotteryPage(lotteryId);
  context('点击首页试玩按钮，[可]登入且进入比特币彩投注页', () => {
    before(() => {
    });
    beforeEach(() => {
      cy.userLogintoLottery();
    });

    it('比特币彩投注，[可]看见两面/1-5球/前中后，乱数投注应成功且顯示投注紀錄', () => {
      cy.wait('@userLogin').then((response)=>{
        const {apistatus, result} = response.response.body;
        if( apistatus === 1){
          expect(apistatus).to.eq(1);
          assert.isObject(result);
          cy.visit(`pc${lotteryPage.url}`);
          cy.getCookie('lotteryId').should('have.property','value', lotteryId.toString());
          cy.confirmTabList(lotteryPage.tabList);
          cy.clickTab(1,lotteryPage.tabList.length)
          cy.isNeedtoBet()
            .fixture('betOrder').then((json)=>{
              if(json.couldBet){
                cy.betOrder();
              } else {
                cy.get('.noTouch').should('be.visible');
              }
            });
        } else {
          cy.wait(500).get('.modal-content')
            .contains('.modal__footer','关闭' )
            .find('.q-btn')
            .click().end();
            return;
        }
      })
    })
  })

})
