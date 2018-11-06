// / <reference types="Cypress" />
import {
  confirmAPI
} from '../../support/mobileUtility.js'

describe('代理申请', () => {


  context('代理加盟API驗證＆進入代理加盟頁', () => {
    let agent;
    before(() => {
      cy.server();
      cy.route('GET', '/forseti/apid/cms/copyright?*').as('about');
      cy.visit('/agent');
      cy.wait('@about').then((response) => {
        agent = confirmAPI(response);
      });
    });

    it('代理加盟标题与内容资料比对', () => {
      cy.get('button.bg-primary').contains(agent[0].title);
      expect('.page-default__content').not.to.be.empty;
    })
  })

  context('佣金方案API驗證＆進入佣金方案頁', () => {
    let agent;
    before(() => {
      cy.server();
      cy.route('GET', '/forseti/apid/cms/copyright?*').as('about');
      cy.get('.q-btn-group > button:nth-child(2)').click()
      cy.wait('@about').then((response) => {
        agent = confirmAPI(response);
      });
    });

    it('佣金方案标题与内容资料比对', () => {
      cy.get('button.bg-primary').contains(agent[0].title);
      expect('.page-default__content').not.to.be.empty;
    })

  })

})
