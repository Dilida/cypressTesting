// / <reference types="Cypress" />
import {
  openLotteryPage, confirmAPI
} from '../../../support/utility.js'

describe('江西11选5投注页面投注验证', () => {
  const lotteryId = 4;
  const lotteryPage = openLotteryPage(lotteryId);
  let lotteryHeader, lotteryAwardHistory, lotteryLoadBead, doubleLong;
  context('点击首页试玩按钮，[可]试玩登入且进入江西11选5投注页', () => {
    before(() => {
      cy.demoLogintoLottery(lotteryId, lotteryPage);
      cy.wait('@lotteryHeader').then((response)=> {
        lotteryHeader = confirmAPI(response);
      })
      cy.wait('@lotteryAwardHistory').then((response) => {
        lotteryAwardHistory = confirmAPI(response);
      })
      cy.wait('@lotteryLoadBead').then((response) => {
        lotteryLoadBead =confirmAPI(response);
      })
      cy.wait('@doubleLong').then((response) => {
        doubleLong= confirmAPI(response);
      })
    });
    beforeEach(() => {
      Cypress.Cookies.preserveOnce("username", "access_pcToken", "acType");
    });
    it('江西11选5投注页header显示，[可]看见投注彩种名及logo/显示注当期期号/上一期期號及開獎結果', () => {
      cy.lotteryHeaderFunc(lotteryHeader);
    })

    it('江西11选5点击玩法说明，[可]看见弹出视窗显示江西11选5玩法说明', () => {
      cy.showLotteryInfo(lotteryHeader.lotteryName);
    })

    it('江西11选5往期開獎紀錄，[可]看見顯示過往紀錄8筆', () => {
      cy.lotteryAwardHistoryFunc(lotteryAwardHistory, lotteryId);
    })

    it('江西11选5点击号码走势，[可]导致往期开奖页面', () => {
      cy.get('.lottery-button-area > :nth-child(1) > .q-btn-inner').click()
        .moreLotteryHistory(lotteryId);
    })

    it('江西11选5路珠及双面长龙，[可]看見或路珠或双面长龙资料', () => {
      cy.lotteryLoadBeadFunc(lotteryLoadBead, doubleLong);
    })

    it('江西11选5投注，[可]看见趣味/1-5球/连码，趣味投注应成功且顯示投注紀錄', () => {
      cy.confirmTabList(lotteryPage.tabList);
      cy.clickTab(1,2);
      cy.isNeedtoBet()
        .fixture('betOrder').then((json)=>{
          if(json.couldBet){
            cy.betOrder();
          } else {
            cy.get('.noTouch').should('be.visible');
          }
        });
    })
    it('江西11选5投注，[可]看见任选投注应成功且顯示投注紀錄', () => {
      cy.clickTab(3,3);
      cy.isNeedtoBet()
        .fixture('betOrder').then((json)=>{
          if(json.couldBet){
            cy.anyBet('lianBet10');
          } else {
            cy.get('.noTouch').should('be.visible');
          }
        });
    })
  })

})
