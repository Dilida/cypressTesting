
import {
    openLotteryPage,
} from '../support/utility.js'
import {
  getBetMaxCount,
} from '../support/mobileUtility.js'

Cypress.Commands.add('apiRoute', () => {
  cy.server();
  cy.route('/forseti/api/pay/receiptClient').as('payWay');
  cy.route('/forseti/api/pay/tradeList?searchType=1&*').as('accountInfo');
  cy.route('/forseti/api/payment/memberBank').as('memberBankInfo');
  cy.route('/forseti/api/playsTree*').as('lotteryGame');
  cy.route('/forseti/api/priodDataNewly?lotteryId=*').as('newPriod');
  cy.route('/forseti/api/priodDataNewlys?sideType=2').as('pastView');
  cy.route('/forseti/apid/cms/activity*').as('activity');
  cy.route('/forseti/apid/cms/carousel').as('carousel');
  cy.route('/forseti/apid/cms/copyright?type=3&code=AT01').as('deposit');
  cy.route('/forseti/apid/cms/msg/status?*').as('msgStatus');
  cy.route('/forseti/apid/cms/notices?*').as('cmsNotices');
  cy.route('/forseti/apid/cms/popText').as('popText');
  cy.route('/forseti/apid/cms/site').as('site');
  cy.route('/forseti/apid/config/appConfig').as('app');
  cy.route('/forseti/apid/config/custConfig').as('cust');
  cy.route('/forseti/apid/icons').as('hotGameIcon');
  cy.route('/forseti/apid/lotterys?*').as('lotteryList');
  cy.route('/forseti/apid/payment/banks').as('paymentBanks');
  cy.route('/hermes/api/balance/get?*').as('balance');
  cy.route('/uaa/apid/member/code/get?time=*').as('code');
  cy.route('/apid/serverCurrentTime*').as('sysTime');
  cy.route('/v1/crowdfunding/ranking').as('ranking');
  cy.route('/v1/crowdfunding/scrollwin').as('scrollWin');
  cy.route('GET', '/uaa/oauth/logout').as('logout');
  cy.route('POST', '/forseti/api/orders/orderList').as('betRecord');
  cy.route('POST', '/uaa/apid/member/login').as('userLogin');
  cy.route('POST', '/uaa/apid/member/testLogin').as('testLogin');
  cy.route('POST', '/forseti/api/orders/betOrder').as('betOrder');
});

Cypress.Commands.add('openLotteryPage', (cid) => {
  const baseUrl = Cypress.config('baseUrl');
  const url = openLotteryPage(cid);
  cy.visit(`${baseUrl}${url.url}`);
});
Cypress.Commands.add('userLogin', () => {
  cy.wait(['@code']);
  cy.get('.q-field').should(($c) => {
    expect($c).to.have.length(3);
  });
  cy.get(':nth-child(1) > .q-field > :nth-child(1) > .q-field-label > .q-field-label-inner')
  .should('contain', '帐号');
  cy.get(':nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col')
  .type(accountName);
  cy.get(':nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col')
  .type('111111');
  cy.pause();
  cy.get(':nth-child(5) > .q-btn > .q-btn-inner').should('contain', '登录').click();
  cy.wait(['@userLogin']).then((response) => {
    const data = Cypress._.extend( response.response.body.data, {
      loginTime: new Date().getTime()
    })
    cy.writeFile('cypress/fixtures/mobileUserLogin.json', data);
  });
  cy.get('.modal-content').should('contain', '登录成功');
  cy.url().should('contain', `${Cypress.config().baseUrl}`);
  cy.get('.modal-content').should('contain', '登录成功');
  cy.getCookie('username').should('have.property', 'value', accountName);
  cy.getCookie('access_token').should('have.property', 'value');
  cy.getCookie('acType').should('have.property', 'value', '1');
})

Cypress.Commands.add('checkCountdown', (nowIssueAlias) => {
  cy.get('.colmun > :nth-child(2) > span').should('be.visible')
    .invoke('html')
    .should('match', /(\d{2}:\d{2}|已封盘)/)
  // 开奖时间
  cy.get('.colmun > :nth-child(3) > span').should('be.visible')
    .invoke('html')
    .should('match', /\d{2}:\d{2}/)
  cy.get('.lottery-countdown__code')
    .invoke('html')
    .should('match', new RegExp(`第(${nowIssueAlias})期`));
});
Cypress.Commands.add('checkLastAwrad', (formatPreIssueAlias) => {
  cy.get('.lottery-top__priod-code__code')
    .invoke('html')
    .should('match', new RegExp(formatPreIssueAlias));
  cy.get('.past-view-ball > .q-list')
    .should($el => { expect($el).not.to.be.empty; });
  cy.get('.items-stretch > .items-end')
    .should($el => { expect($el).not.to.be.empty; });
});
Cypress.Commands.add('checkPlayKinds', (cid) => {
  const kinds = openLotteryPage(cid);
  cy.get('.col-3 > .scroll > .q-list > button')
    .should(($button) => {
      expect($button).not.to.be.empty;
      kinds.tabList.forEach((label, i) => {
        expect($button.eq(i)).to.contain(label);
      })
    });
});
Cypress.Commands.add('checkPlayGroups', () => {
  cy.get('.play-tree__list > .play-tree__block')
    .should(($block) => { expect($block).not.to.be.empty; });
});

Cypress.Commands.add('getNewPriod', () => {
  return cy.wait('@newPriod')
  .then((response) => {
    expect(response.response.body.data).not.to.be.empty
    return cy.getPriodData(response.response.body.data, 0);
  });
});

Cypress.Commands.add('randomBetClick', (maxBetCount = 0) => {
  cy.get('.play-tree__block__list').find('.bet-item').filter('div')
  .then(($el) => {
    if (maxBetCount == 0) {
      maxBetCount = Cypress._.random(3, 5);
    }
    const randomRange = Cypress._.sampleSize(Cypress._.range($el.length), maxBetCount);
    randomRange.forEach((i) => {
      cy.wrap($el.eq(i)).click();
    })
  });
  cy.get('.q-if-inner > .col').type(`{backspace}{backspace}${Cypress._.random(1,3)}`);
});

Cypress.Commands.add('waitOpen', () => {
  cy.get('.lottery-footer__fongpan').should('not.exist');
  cy.get('.colmun > :nth-child(2) > span').then((response) => {
    const timeout = Cypress.moment.duration(response.text(), "mm:ss").get('ms');
    if (timeout < 20000) {
      cy.log('timeout', timeout);
      cy.wait(timeout);
    }
    cy.get('.colmun > :nth-child(3) > span').then((response) => {
      if (/00:0\d{1}|已封盘/.test(response.text())){
        cy.wait(timeout);
      }
    });
  });
  // const endTime = Cypress.$('.colmun > :nth-child(3) > span').text();
  // const isClose = Cypress.$('.lottery-footer__fongpan').text();
  // const closeTime = Cypress.$('.colmun > :nth-child(2) > span').text();
  // if (/00:0\d{1}|已封盘/.test(closeTime) || isClose != '') {
  // }
});


Cypress.Commands.add('betOrder', () => {
  cy.get('.btn-bet > .q-btn-inner > div')
  .should('contain', '下注')
  .click();
  cy.wait(500);
  cy.get('.modal-bet > .modal-content').contains('确定').click();
  cy.wait(['@betOrder']);
  cy.get('@betOrder').then((response) => {
    const orderId = Cypress._.get(response.response.body, 'data.orderId', false);
    assert.isString(orderId, 'value is string')
  });
});

Cypress.Commands.add('randomBet', (kindsLabel, maxBet = 0) => {
  cy.route('POST', '/forseti/api/orders/betOrder').as('betOrder');
  cy.contains(kindsLabel).click();
  cy.wait(1000)
  cy.waitOpen();
  if (kindsLabel === '连码') {
    return;
  }
  cy.randomBetClick(maxBet);
  cy.betOrder();
});

/*====== 20181031 add from Dilida =====*/

Cypress.Commands.add('demoLogin', () => {
  // 试玩登录
  // cy.checkRoutePageUrl('');
  cy.get(':nth-child(3) > .q-btn-inner > div').as('DemoPlay')
    .click(); // .wait(1000);
  cy.wait(['@testLogin']).then(() => {
    // 弹窗提示
    cy.get('.modal-auto__body__content').as('autoDialog')
      .should('be.visible').contains('登录成功');
    cy.getCookie('access_token').should('have.property', 'value');
    cy.getCookie('acType').should('have.property', 'value', '2');
    cy.get('.modal-footer').should('be.not.visible');
  });
})

Cypress.Commands.add('logout', () => {
  // ready go logout and see the leftside slide in
  cy.get('.q-toolbar > .q-btn > .q-btn-inner > .q-icon').click()
    .get('.q-layout-drawer > .q-list').should('be.visible')
    .get('.lobby-left-drawer__btn-group > .q-btn > .q-btn-inner').click()
  cy.wait('@logOut').then((response) => {
    const {err} = response.response.body;
    assert.isNotNull(err,'is not null');
    cy.get('.modal-auto__body__content').as('autoDialog')
    .should('be.visible').contains('注销成功');
  })
})

Cypress.Commands.add('checkRoutePageUrl', (url, title = false)  => {
  cy.url().should('contain', `${Cypress.config().baseUrl}${url}`);
  if (title) {
    cy.get('.q-toolbar').should('contain', title);
  }
})

Cypress.Commands.add('demoLogintoLottery', (lotteryId, lotteryPage) => {
  cy.visit(Cypress.env("target"));
  cy.demoLogin();
  cy.lotteryPageRoute();
  cy.visit(lotteryPage.url);
  cy.getCookie('lotteryId').should('have.property','value', lotteryId.toString());
})

Cypress.Commands.add('lotteryPageRoute', () => {
  cy.server();
  cy.route('GET','/forseti/api/priodDataNewly?lotteryId=*').as('priodDateNewly');
})

Cypress.Commands.add('lotteryHeaderFunc', (lotteryHeader) => {
  cy.get('.lottery-top__priod-code__code').contains(lotteryHeader[2].pcode);
  cy.get('.lottery-countdown__code').contains(lotteryHeader[1].pcode);
  cy.get('.past-view-ball > .q-list').contains(lotteryHeader[2].winNumber.split(',')[0]);
})

Cypress.Commands.add('confirmTabList', (tabList) => {
  tabList.forEach((label,index) => {
    cy.get(`.scroll > .q-list > :nth-child(${index+1})`).contains(label);
  });
})

Cypress.Commands.add('checkLotteryRecord', () => {
  cy.get('.q-mr-sm').click()
    .get('.q-popover > .q-list').should('be.visible')
    .get('.q-popover > .q-list').contains('投注记录').click()
  cy.url().should('include','betRecord')
    .wait('@orderList').then( (response)=> {
      const orderDataLength = response.response.body.data.total
      cy.get('.q-collapsible-sub-item > .q-list > div').should('have.length', orderDataLength);
    })
})

Cypress.Commands.add('showLotteryInfo', (lotteryName) => {
  cy.get('.q-mr-sm').click()
    .get('.q-popover > .q-list').should('be.visible')
    .get('.q-popover > .q-list').contains('玩法说明').click()
  cy.get('.modal-header').contains(lotteryName)
    .get('.modal-footer > .q-btn > .q-btn-inner').click();
})

Cypress.Commands.add('moreLotteryHistory', (lotteryName) => {
  cy.get('.q-mr-sm').click()
    .get('.q-popover > .q-list').should('be.visible')
    .get('.q-popover > .q-list').contains('往期开奖').click()
  cy.url().should('contain', 'pastView')
  cy.get('.q-toolbar-title').contains(lotteryName).go(-1);
})

Cypress.Commands.add('lotteryLoadBeadFunc', (lotteryLoadBead, doubleLong) => {
  if(!lotteryLoadBead){
    cy.get('.q-mr-sm').click()
      .get('.q-popover > .q-list').should('be.visible')
      .get('.q-popover > .q-list').contains('路珠').click();
    cy.url().should('contain', 'roadBeads').go(-1)
  }
  if(!doubleLong){
    cy.get('.q-mr-sm').click()
      .get('.q-popover > .q-list').should('be.visible')
      .get('.q-popover > .q-list').contains('双面长龙').click()
    cy.url().should('contain', 'dsLong');
  }
})
