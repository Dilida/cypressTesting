// / <reference types="Cypress" />
import {
  confirmAPI, roundAmt
} from '../../support/utility.js'

describe('个人中心-账户管理', () => {
  let memberInfo;
  let pageUrl = '/member/accountManage';
  before(() => {
    cy.server();
    cy.route('GET','/member/v1/info').as('memberInfo');
    cy.memberPage(pageUrl);
    cy.wait('@memberInfo').then((response) => {
      memberInfo = confirmAPI(response);
    })
  });
  beforeEach(() => {
    Cypress.Cookies.preserveOnce("username", "access_pcToken", "acType");
  });

  context('登入后进入个人中心，确定账户管理资料是否与api相同', () => {

    it('个人中心-个人资料，帐号安全资料比对', () => {
      cy.get('.q-tab-pane > .col-12 > :nth-child(1)').contains(memberInfo.bankInfo.realName);
      cy.get('.q-tab-pane > .col-12 > :nth-child(2)').contains(memberInfo.bankInfo.bankName);
      cy.get('.q-tab-pane > .col-12 > :nth-child(3)').contains(memberInfo.bankInfo.bankDeposit);
      cy.get('.q-tab-pane > .col-12 > :nth-child(4)').contains(memberInfo.bankInfo.bankCardNo);
      cy.get('.q-tab-pane > .col-12 > :nth-child(5)').contains(memberInfo.bankInfo.mobile);
    });

    it('个人中心-个人资料，个人信息资料比对、可更改', () => {
      cy.get('.q-tabs-scroller > :nth-child(2)').click();
      cy.get('.q-field-content > .q-if > .q-if-inner > .col').should('be.disabled');
      // input 找不到值
      // cy.get('.col-12 > :nth-child(1) > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').contains(memberInfo.memberInfo.wechat);
      // cy.get(':nth-child(2) > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').contains(memberInfo.memberInfo.qq);
      // cy.get(':nth-child(3) > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').contains(memberInfo.memberInfo.email);
      cy.get('.layout-page-footer .btn-primary').click();
      cy.get('.col-12 > :nth-child(1) > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').clear();
      cy.get('.col-12 > :nth-child(1) > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type('wechat1');
      cy.get('.layout-page-footer .btn-primary').click();
    })

    it('个人中心-个人资料，用户名、余额是否正确，立即充值按钮可点击', () => {
      cy.get('.account-manage-info > :nth-child(1) > span:nth-child(2)').contains(memberInfo.memberInfo.name);
      cy.get('.account-manage-info > :nth-child(2) > span:nth-child(2)').contains(roundAmt(memberInfo.memberInfo.balance));
      cy.get('.account-manage-info .q-btn').click();
      cy.go('back');
    })

  })

  context('个人中心-密码管理，可修改登入及取款密码', () => {
    let loginPassword;
    let passwordOld = 'tony123';
    let passwordNew = 'tony111';
    let payPasswordOld = '1234';
    let payPasswordNew = '1111';

    before(() => {
      cy.visit('/pc/member/accountPasswordManage');
    });

    it('个人中心-密码管理，修改登入密码，原密码错误，跳错误弹窗', () => {
      cy.get('.col-12 > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordNew);
      cy.get('.col-12 > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordOld);
      cy.get('.col-12 > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordOld);
      cy.get('.reset-password__btn > .q-btn').click();
      cy.wait(3000).get('.modal-content').contains('原密码错误');
      cy.get('.modal__footer > .q-btn').click();
      cy.get('.col-12 .q-field input').clear();
    })

    it('个人中心-密码管理，修改登入密码，旧密码与新密码相同，跳错误弹窗', () => {
      cy.get('.col-12 > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordOld);
      cy.get('.col-12 > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordOld);
      cy.get('.col-12 > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordOld);
      cy.get('.reset-password__btn > .q-btn').click();
      cy.wait(3000).get('.modal-content').contains('不能相同');
      cy.get('.modal__footer > .q-btn').click();
      cy.get('.col-12 .q-field input').clear();
    })

    it('个人中心-密码管理，修改登入密码，确认密码与新密码不同，跳错误弹窗', () => {
      cy.get('.col-12 > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordOld);
      cy.get('.col-12 > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordNew);
      cy.get('.col-12 > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordOld);
      cy.get('.reset-password__btn > .q-btn').click();
      cy.wait(3000).get('.modal-content').contains('确认密码错误');
      cy.get('.modal__footer > .q-btn').click();
      cy.get('.col-12 .q-field input').clear();
    })


    it('个人中心-密码管理，修改登入密码成功', () => {
      cy.get('.col-12 > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordOld);
      cy.get('.col-12 > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordNew);
      cy.get('.col-12 > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordNew);
      cy.get('.reset-password__btn > .q-btn').click();
      cy.wait(3000).get('.modal-content').contains('成功');
      cy.get('.modal__footer > .q-btn').click();
      cy.get('.col-12 .q-field input').clear();

      // 再做一次来还原密码
      cy.get('.col-12 > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordNew);
      cy.get('.col-12 > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordOld);
      cy.get('.col-12 > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(passwordOld);
      cy.get('.reset-password__btn > .q-btn').click();
      cy.get('.modal__footer > .q-btn').click();
    });

    it('个人中心-密码管理，修改取款密码，原密码错误，跳错误弹窗', () => {
      cy.get('.q-tabs-scroller > :nth-child(2)').click();
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordNew);
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordOld);
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordOld);
      cy.get(':nth-child(2) > .reset-password > .col-12 > .reset-password__btn > .q-btn').click();
      cy.wait(3000).get('.modal-content').contains('原密码错误');
      cy.get('.modal__footer > .q-btn').click();
      cy.get(':nth-child(2) > .reset-password > .col-12 .q-field input').clear();
    })

    it('个人中心-密码管理，修改取款密码，旧密码与新密码相同，跳错误弹窗', () => {
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordOld);
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordOld);
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordOld);
      cy.get(':nth-child(2) > .reset-password > .col-12 > .reset-password__btn > .q-btn').click();
      cy.wait(3000).get('.modal-content').contains('不能相同');
      cy.get('.modal__footer > .q-btn').click();
      cy.get(':nth-child(2) > .reset-password > .col-12 .q-field input').clear();
    })

    it('个人中心-密码管理，修改取款密码，确认密码与新密码不同，跳错误弹窗', () => {
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordOld);
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordNew);
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordOld);
      cy.get(':nth-child(2) > .reset-password > .col-12 > .reset-password__btn > .q-btn').click();
      cy.wait(3000).get('.modal-content').contains('确认密码错误');
      cy.get('.modal__footer > .q-btn').click();
      cy.get(':nth-child(2) > .reset-password > .col-12 .q-field input').clear();
    })

    it('个人中心-密码管理，修改取款密码成功', () => {
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordOld);
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordNew);
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordNew);
      cy.get(':nth-child(2) > .reset-password > .col-12 > .reset-password__btn > .q-btn').click();
      cy.wait(3000).get('.modal-content').contains('成功');
      cy.get('.modal__footer > .q-btn').click();
      cy.get(':nth-child(2) > .reset-password > .col-12 .q-field input').clear();

      // 再做一次来还原密码
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordNew);
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordOld);
      cy.get(':nth-child(2) > .reset-password > .col-12 > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(payPasswordOld);
      cy.get(':nth-child(2) > .reset-password > .col-12 > .reset-password__btn > .q-btn').click();
      cy.get('.modal__footer > .q-btn').click();
    });

  })

})
