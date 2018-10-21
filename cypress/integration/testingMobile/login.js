// / <reference types="Cypress" />
import {
  visitBlc
} from '../../support/utility.js';

import {
  demoLogin,
  userLogin,
} from '../../support/mobileUtility.js'

describe('Mobile Login Test', () => {
  before(() => {
  });

  beforeEach(() => {
    cy.viewport('iphone-6');
    cy.server();
    cy.route('/uaa/apid/member/code/get?time=*').as('code');
    cy.route('POST', '/uaa/apid/member/login').as('userLogin');
    cy.route('POST', '/uaa/apid/member/testLogin').as('testLogin');
    visitBlc();
  });

  after(() => {
  });

  it('demoLogin', () => {
    demoLogin();
  });

  it('userLogin', () => {
    cy.contains('登录').click();
    userLogin();
  });
});
