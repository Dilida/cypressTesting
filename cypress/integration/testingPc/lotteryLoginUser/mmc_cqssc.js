// / <reference types="Cypress" />
import {
  openLotteryPage, confirmAPI
} from '../../../support/utility.js'

describe.skip('重庆秒秒彩投注页面投注验证', () => {
  const lotteryId = 116;
  const lotteryPage = openLotteryPage(lotteryId);
  context('点击首页试玩按钮，[可]登入且进入重庆秒秒彩投注页', () => {
    before(() => {
      cy.userLogintoLottery(lotteryId, lotteryPage);
    });
    beforeEach(() => {
      Cypress.Cookies.preserveOnce("username", "access_pcToken", "acType");
    });

    it('重庆秒秒彩投注，[可]看见两面/1-5球/前中后，乱数投注应成功且顯示投注紀錄', () => {
      cy.confirmTabList(lotteryPage.tabList);
      cy.get(`.bet-tags-wrap > .swiper-container > .swiper-wrapper > :nth-child(${Cypress._.random(1,lotteryPage.tabList.length)})`)
        .click()
      cy.isNeedtoBet()
        .fixture('betOrder').then((json)=>{
          if(json.couldBet){
            cy.betOrder();
          } else {
            cy.get('.noTouch').should('be.visible');
          }
        });
    })
  })

})
