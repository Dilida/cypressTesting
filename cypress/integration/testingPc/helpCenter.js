// / <reference types="Cypress" />
import {
  confirmAPI
} from '../../support/utility.js'

describe('帮助中心、关于我们', () => {


  context('帮助中心-新手教程标题与内容资料比对', () => {
    let helpCenter;
    before(() => {
      cy.server();
      cy.route('GET','/cms/v1/about?type=*').as('about');
      cy.visit('/pc/helpCenter/helpCenterTutorial');
      cy.wait('@about').then((response) => {
        helpCenter = confirmAPI(response);
      });
    });

    it('新手教程', () => {
      cy.get('.bread-crumbs').contains(helpCenter.title);
      cy.get('.help-block').should('have.html', helpCenter.content);
    })
  })

  context('帮助中心-充值教程标题与内容资料比对', () => {
    let helpCenter;
    before(() => {
      cy.server();
      cy.route('GET','/cms/v1/about?type=*').as('about');
      cy.visit('/pc/helpCenter/helpCenterRecharge');
      cy.wait('@about').then((response) => {
        helpCenter = confirmAPI(response);
      });
    });

    it('充值教程', () => {
      cy.get('.bread-crumbs').contains(helpCenter.title);
      cy.get('.help-block').should('have.html', helpCenter.content);
    })

  })

  context('帮助中心-代理加盟标题与内容资料比对', () => {
    let helpCenter;
    before(() => {
      cy.server();
      cy.route('GET','/cms/v1/about?type=*').as('about');
      cy.visit('/pc/helpCenter/helpCenterRecharge');
      cy.wait('@about').then((response) => {
        helpCenter = confirmAPI(response);
      });
    });

    it('代理加盟', () => {
      cy.get('.bread-crumbs').contains(helpCenter.title);
      cy.get('.help-block').should('have.html', helpCenter.content);
    })

  })

  context('帮助中心-佣金方案标题与内容资料比对', () => {
    let helpCenter;
    before(() => {
      cy.server();
      cy.route('GET','/cms/v1/about?type=*').as('about');
      cy.visit('/pc/helpCenter/helpCenterRecharge');
      cy.wait('@about').then((response) => {
        helpCenter = confirmAPI(response);
      });
    });

    it('佣金方案', () => {
      cy.get('.bread-crumbs').contains(helpCenter.title);
      cy.get('.help-block').should('have.html', helpCenter.content);
    })
  })

  context('关于我们标题与内容资料比对', () => {
    let helpCenter;
    before(() => {
      cy.server();
      cy.route('GET','/cms/v1/about?type=*').as('about');
      cy.visit('/pc/helpCenter/helpCenterRecharge');
      cy.wait('@about').then((response) => {
        helpCenter = confirmAPI(response);
      });
    });

    it('关于我们', () => {
      cy.get('.bread-crumbs').contains(helpCenter.title);
      cy.get('.help-block').should('have.html', helpCenter.content);
    })


  })

})
