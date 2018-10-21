// / <reference types="Cypress" />
import {
  confirmAPI, time2Date
} from '../../support/utility.js'

describe('个人中心-公告管理', () => {
  let msgList;
  let pageUrl = '/member/accountNotification';
  before(() => {
    cy.server();
    cy.route('GET','/cms/v1/msg/list?page=*').as('msg');
    cy.memberPage(pageUrl);
    cy.wait('@msg').then((response) => {
      msgList = confirmAPI(response);
    })
  });
  beforeEach(() => {
    Cypress.Cookies.preserveOnce("username", "access_pcToken", "acType");
  });

  context('个人中心-个人消息', () => {

    it('个人中心-个人消息，第一笔标题内容比对，点击标题出现弹窗', () => {
      cy.get('.table-normal > tbody > tr:first-child > td:first-child').contains(msgList.list[0].title);
      cy.get('.table-normal > tbody > tr:first-child > td:last-child').contains(time2Date(msgList.list[0].createTime));
      cy.get('.table-normal > tbody > tr:first-child > td:first-child').click();
      cy.wait(500).get('.modal__header-title').contains(msgList.list[0].title);
      cy.get('.modal-content:visible').contains(msgList.list[0].content);
      cy.get('.modal-content:visible .modal__header .q-btn').click();
    })

  })

})
