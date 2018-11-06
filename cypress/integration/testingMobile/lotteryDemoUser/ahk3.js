// / <reference types="Cypress" />
import '../../../support/commands.mobile';
import {
  openLotteryPage
} from '../../../support/utility.js'
import {
  confirmAPI, checkRoadBead, checkDoubleLong
} from '../../../support/mobileUtility.js'

describe('安徽快3投注页面投注验证', () => {
  const lotteryId = 20;
  const lotteryPage = openLotteryPage(lotteryId);
  let priodDateNewly, lotteryList, lotteryName;
  before(() => {
    cy.server();
    cy.route('POST', '/uaa/apid/member/testLogin').as('testLogin');
    cy.route('GET', '/forseti/apid/lotterys?*').as('lotteryList');
    cy.demoLogintoLottery(lotteryId, lotteryPage);

    cy.wait('@priodDateNewly').then((response)=> {
      priodDateNewly = confirmAPI(response);
    })
    cy.wait('@lotteryList').then((response) => {
      lotteryList = confirmAPI(response);
      lotteryName = (lotteryList.filter((x) => x.cid === lotteryId))[0].name;
    })
  });
  context('点击首页试玩按钮，[可]试玩登入且进入安徽快3投注页', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce("username", "access_token", "acType");
    });

    it('安徽快3投注，[可]看见单骰/不同号/同号/总和，乱数投注应成功且顯示投注紀錄', () => {
      cy.server();
      cy.route('POST', '/forseti/api/orders/orderList').as('orderList');
      cy.confirmTabList(lotteryPage.tabList);
      cy.randomBet(lotteryPage.tabList[Cypress._.random(0,lotteryPage.tabList.length-1)]);
      cy.checkLotteryRecord().go(-1);
    })

    it('安徽快3点击号码走势，[可]导致往期开奖页面', () => {
      cy.moreLotteryHistory(lotteryName);
    })

    it('安徽快3投注页header显示，[可]看见投注彩种名显示注当期期号/上一期期號及開獎結果', () => {
      cy.get('.q-toolbar > .q-toolbar-title').contains(lotteryName);
      cy.lotteryHeaderFunc(priodDateNewly);
    })

    it('安徽快3点击玩法说明，[可]看见弹出视窗显示安徽快3玩法说明', () => {
      cy.showLotteryInfo(lotteryName);
    })
    it('安徽快3路珠及双面长龙，[可]看見或路珠或双面长龙资料', () => {
      cy.reload();
      cy.lotteryLoadBeadFunc(checkRoadBead(lotteryId), checkDoubleLong (lotteryId));
    })
  })

})
