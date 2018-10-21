/// <reference types="Cypress" />
import {
  visitBlc
} from '../../support/utility.js'

context('登入api', () => {
  beforeEach(() => {
    visitBlc();
  });
  it('demoAPI test', () => {
    cy.get('body').should('be.visible')
    cy.request({ //demologin api
        method: 'POST',
        url: 'http://api.baochi888.com/uaa/apid/member/testLogin',
        headers: {
          Authorization: 'Basic d2ViX2FwcDo=',
          Host: 'api.baochi888.com',
          Origin: 'http://blc.baochi888.com',
          Referer: 'http://blc.baochi888.com',
        },
        form: true,
      }).then((res) => {
        cy.writeFile('cypress/fixtures/users.json', { access_token : `bearer ${res.body.data.access_token}`})
        expect(res.status).to.eq(200);
        expect(res.body.err).to.eq("SUCCESS"); //遊客登入成功
      })
      cy.wait(500)
        .fixture('users').as('access_token').then((users)=>{
          cy.request({ //logout api
            method: 'GET',
            url: 'http://api.baochi888.com/uaa/oauth/logout',
            headers: {
              Authorization: users.access_token,
              Host: 'api.baochi888.com',
              Origin: 'http://blc.baochi888.com',
              Referer: 'http://blc.baochi888.com',
            },
            form: true,
          })
          .then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.err).to.eq("SUCCESS"); //遊客登出成功
          })
        })
  });
})
