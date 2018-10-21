import {
  lotteryConst, openLotteryPage,
} from '../support/utility.js'

export const time2Date = (timestamp, pattern = 'YYYY/MM/DD HH:mm:ss') => {
  return Cypress.moment(parseInt(timestamp, 10)).format(pattern);
};

export const roundAmt = (v) => {
  return (v / 100).toFixed(2);
};

export const fmoney = (s, n) => {
  n = n > 0 && n <= 20 ? n : 2;
  s = `${parseFloat((`${s}`).replace(/[^[0-9]\.-]/g, '')).toFixed(n)}`;
  const l = s.split('.')[0].split('').reverse();
  const r = s.split('.')[1];
  let t = '';
  l.forEach((item, i) => {
    t += item + ((i + 1) % 3 === 0 && (i + 1) !== l.length ? ',' : '');
  });
  return `${t.split('').reverse().join('')}.${r}`;
};

const accountName = 'mandy';

export const dialogClose = () => {
  cy.get('.modal-content').should('be.visible');
  cy.get('.icon-pop').should('have.class', 'icon-pop--notice');
  cy.wait(500);
  cy.get('.q-btn-outline > .q-btn-inner').should('be.visible').and('contain', '取消').click();
  cy.get('.modal-auto__body__content').should('be.not.visible');
};

export const memoLogin = () => {
  // 试玩登录
  checkRoutePageUrl('');
  cy.get(':nth-child(3) > .q-btn-inner > div').as('DemoPlay')
    .click(); // .wait(1000);
  cy.wait(['@testLogin']).then((response) => {
    const data = Cypress._.extend( response.response.body.data, {
      loginTime: new Date().getTime()
    })
    cy.writeFile('cypress/fixtures/mobileDemoLogin.json', data);
  });
  // 弹窗提示
  cy.get('.modal-auto__body__content').as('autoDialog')
    .should('be.visible').contains('登录成功');
  cy.getCookie('access_token').should('have.property', 'value');
  cy.getCookie('acType').should('have.property', 'value', '2');
  cy.get('.modal-footer').should('be.not.visible');
};

export const userLogin = () => {
  checkRoutePageUrl('/login');
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
}

export const setDemoCookies= (win) => {
  ['acType', 'access_token', 'username'].forEach((item) => {
    win.Cypress.cy.setCookie(item, Cypress._.get(demoUserJson, item).toString());
  })
};
// export const setUserCookies = () => {
//   cy.readFile('cypress/fixtures/mobileUserLogin.json').then((response) => {
//     ['acType', 'access_token', 'username'].forEach((item) => {
//       cy.setCookie(item, Cypress._.get(response, item).toString());
//     })
//   });
// };
// export const closeHomePopText = () => {
//   cy.route('/forseti/apid/cms/popText').as('popText');
//   // 首页弹窗
//   cy.wait(['@popText']);
//   cy.get('.dialog-header > .q-btn').should('contain', 'close').click();
// };

export const openMenu = () => {
  cy.get('.q-toolbar').find('.q-btn > .q-btn-inner > .q-icon')
  .should('be.visible').and('have.class', 'icon-tool--nav').click();
};

export const checkRoutePageUrl = (url, title = false) => {
  cy.url().should('contain', `${Cypress.config().baseUrl}${url}`);
  if (title) {
    cy.get('.q-toolbar').should('contain', title);
  }
};

export const useIssueAlias = (lotteryId) => {
  return lotteryConst.issueAliasLotteryIds.includes(parseInt(lotteryId, 10));
};

export const formatIssueAlias = (data) => {
  if (!data.issueAlias && !data.pcode) {
    return '';
  }
  // 使用日期时间作为奖期
  if (lotteryConst.datetimeLotteryIds.includes(data.lotteryId)) {
    const betTime = Cypress._.get(data, 'betTime', data.startTime);
    return time2Date(betTime);
  }
  const issueAlias = useIssueAlias(data.lotteryId) ? data.issueAlias : data.pcode;
  return `${issueAlias}期`;
};

export const getPriodData = (data) => {
  if (data.length === 0) return { formatPreIssueAlias: '' };

  const nowTime = parseInt(`${Math.floor(new Date().getTime() / 1000)}000`, 10);
  // 最后一期有奖号的资料
  const prePriod = data.find(f => f.winNumber !== '');

  // 下期
  let nextPriod = data.find(f => f.startTime > nowTime);

  // 当期
  let nowPriod = data.find(f => f.startTime < nowTime && f.endTime > nowTime);

  if (!nowPriod) return Cypress.moment(Cypress._.get(data, '0.endTime'));

  // 封盘状态
  if (nowPriod.endTime < nowTime) {
    [nowPriod, nextPriod] = [nextPriod, {}];
  }

  if (nextPriod) {
    nowPriod.pcode = `${nowPriod.pcode}|${nextPriod.pcode}`;
    nowPriod.issueAlias= `${nowPriod.issueAlias}|${nextPriod.issueAlias}`;
  }

  return {
    nowPriod,
    nextPriod,
    prePriod,
    // 显示用奖期
    nowIssueAlias: useIssueAlias(nowPriod.lotteryId) ? nowPriod.issueAlias : nowPriod.pcode,
    // 显示用上期
    formatPreIssueAlias: formatIssueAlias(prePriod, 2),
  };
};

export const getKinds = (cid) => {
 return openLotteryPage(cid);
};

export const getBetMaxCount = (kindsLabel) => {
  if (kindsLabel !== '连码') return 5;
  return cy.get('.q-btn-group > .text-primary').then((response) => {
    return response.text();
  });
  // const button = Cypress.$('.play-group-tabs > .q-item > .q-btn-group button');
  // console.info('button.length', button.length);
};

