// / <reference types="Cypress" />
import {
  confirmAPI
} from '../../support/mobileUtility.js'

describe('新手教程', () => {


  context('新手教程API驗證＆進入新手教程頁', () => {
    let tutorial;
    before(() => {
      cy.server();
      cy.route('GET', '/forseti/apid/cms/copyright?*').as('about');
      cy.visit('/tutorial');
      cy.wait('@about').then((response) => {
        tutorial = confirmAPI(response);
      });
    });

    it('新手教程标题与内容资料比对', () => {
      cy.get('button.bg-primary').contains(tutorial[0].title);
      expect('.page-default__content').not.to.be.empty;
    })
  })

  context('充值教程API驗證＆進入充值教程頁', () => {
    let tutorial;
    before(() => {
      cy.server();
      cy.route('GET', '/forseti/apid/cms/copyright?*').as('about');
      cy.get('.q-btn-group > button:nth-child(2)').click()
      cy.wait('@about').then((response) => {
        tutorial = confirmAPI(response);
      });
    });

    it('充值教程标题与内容资料比对', () => {
      cy.get('button.bg-primary').contains(tutorial[0].title);
      expect('.page-default__content').not.to.be.empty;
    })

  })


})
