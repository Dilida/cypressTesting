// / <reference types="Cypress" />
import {
  openLotteryPage,
} from '../../../support/utility.js'

describe('幸运农场投注页面投注验证', () => {
  const lotteryId = 46;
  const lotteryPage = openLotteryPage(lotteryId);
  let userLogin;
  context('点击首页试玩按钮，[可]登入且进入幸运农场投注页', () => {
    before(() => {
      cy.userLogintoLottery();
      cy.wait('@userLogin').then((response) => {
        const {apistatus} = response.response.body;
        if(apistatus === 1){
          const {result} = response.response.body;
          userLogin = {apistatus, result};
        }
        else {
          userLogin = {apistatus};
        }
      })
    });
    beforeEach(() => {
      Cypress.Cookies.preserveOnce("username", "access_pcToken", "acType");
    });

    it('幸运农场投注，[可]看见趣味/任选/1-5名，趣味投注应成功且顯示投注紀錄', () => {
        if(userLogin.apistatus === 1){
          cy.visit(`pc${lotteryPage.url}`);
          cy.getCookie('lotteryId').should('have.property','value', lotteryId.toString());
          cy.confirmTabList(lotteryPage.tabList);
          cy.clickTab(1,1);
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
    it('幸运农场投注，[可]看见任选投注应成功且顯示投注紀錄', () => {
      if(userLogin.apistatus === 1){
        cy.visit(`pc${lotteryPage.url}`);
        cy.confirmTabList(lotteryPage.tabList);
        cy.clickTab(2,2);
        cy.isNeedtoBet()
          .fixture('betOrder').then((json)=>{
            if(json.couldBet){
              cy.anyBet('anyBet4');
            } else {
              cy.get('.noTouch').should('be.visible');
            }
          });
      } else {
        cy.url().should('contain', '/pc');
      }
    })
    it('幸运农场投注，[可]看见连码投注应成功且顯示投注紀錄', () => {
      if(userLogin.apistatus === 1){
        cy.visit(`pc${lotteryPage.url}`);
        cy.confirmTabList(lotteryPage.tabList);
        cy.clickTab(3,3);
        cy.isNeedtoBet()
          .fixture('betOrder').then((json)=>{
            if(json.couldBet){
              cy.lianBet('lianBet4');
            } else {
              cy.get('.noTouch').should('be.visible');
            }
          });
      } else {
        cy.url().should('contain', '/pc');
      }
    })
  })

})
