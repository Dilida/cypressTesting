// / <reference types="Cypress" />
import {
  confirmAPI
} from '../../support/mobileUtility.js'

describe('關於我們', () => {


  context('關於我們API驗證＆進入關於我們頁', () => {
    let about;
    before(() => {
      cy.server();
      cy.route('GET', '/forseti/apid/cms/copyright?*').as('about');
      cy.visit('/about');
      cy.wait('@about').then((response) => {
        about = confirmAPI(response);
      });
    });

    it('關於我們标题与内容资料比对', () => {
      expect('.page-default__content').not.to.be.empty;
    })
  })

})