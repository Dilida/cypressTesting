/// <reference types="Cypress" />
import {
  visitBlc, openLotteryPage, demoLogin, demoLogout, betOrderAPI
} from '../../support/utility.js'
let myConfig = Cypress.config();

context('開啟比特幣彩api', () => {
  let lotteryPage;
  let pCodeValue;
  before(() => {
    visitBlc();
    cy.get('body').should('be.visible')
    demoLogin();
    lotteryPage = openLotteryPage(48);
    cy.visit(lotteryPage.url);
    cy.getCookie('lotteryId').should('have.property','value', '48');
    cy.getCookies().then((cookies) => {
      cy.writeFile('cypress/fixtures/users.json', { access_token : `bearer ${cookies[1].value}`})
    })
    cy.fixture('users').as('access_token').then((users)=>{
      cy.request({ //demologin api
        method: 'GET',
        url: myConfig.host+ '/forseti/api/priodDataNewly?lotteryId=48',
        headers: {
          Authorization: users.access_token,
          Host: myConfig.host,
          Origin: myConfig.baseUrl,
          Referer: myConfig.baseUrl + lotteryPage.url,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.err).to.eq("SUCCESS");
        pCodeValue= {
          pcode: res.body.data[1].pcode,
          pdate: res.body.data[1].pdate
        }
      })
    })
  });
  beforeEach(() =>{
    Cypress.Cookies.preserveOnce("username", "access_token", "acType");
  })
  after(() => {
    visitBlc();
    demoLogout();
  })
  it('前中后', () => {
    const body = {
      "list":[
          {
              "betAmount":100,
              "betContent":"大",
              "betCount":1,
              "playId":21101,
              "betMode":0,
              "chaseCount":1,
              "ifChase":0,
              "moneyMode":"y",
              "payoff":0,
              "remark":"无",
              "multiple":1
          }
      ],
      "amount":100,
      "lotteryId":48,
      "operType":0,
      "pcode":pCodeValue.pcode,
      "pdate":pCodeValue.pdate,
      "remark":"无",
      "source":"h5",
      "sourceType":"2"
  };
    betOrderAPI(body, lotteryPage.url);
  });
  it('1-5球', () => {
    const body = {
      "list":[
          {
              "betAmount":300,
              "betContent":"2",
              "betCount":1,
              "playId":22102,
              "betMode":0,
              "chaseCount":1,
              "ifChase":0,
              "moneyMode":"y",
              "payoff":0,
              "remark":"无",
              "multiple":3
          },
          {
              "betAmount":300,
              "betContent":"1",
              "betCount":1,
              "playId":22201,
              "betMode":0,
              "chaseCount":1,
              "ifChase":0,
              "moneyMode":"y",
              "payoff":0,
              "remark":"无",
              "multiple":3
          },
          {
              "betAmount":300,
              "betContent":"4",
              "betCount":1,
              "playId":22304,
              "betMode":0,
              "chaseCount":1,
              "ifChase":0,
              "moneyMode":"y",
              "payoff":0,
              "remark":"无",
              "multiple":3
          }
      ],
      "amount":900,
      "lotteryId":48,
      "operType":0,
      "pcode":pCodeValue.pcode,
      "pdate":pCodeValue.pdate,
      "remark":"无",
      "source":"h5",
      "sourceType":"2"
    }
    betOrderAPI(body, lotteryPage.url);
  });
  it('兩面彩UI', () => {
    const body=
      {
        "list":[
            {
                "betAmount":300,
                "betContent":"豹子",
                "betCount":1,
                "playId":23101,
                "betMode":0,
                "chaseCount":1,
                "ifChase":0,
                "moneyMode":"y",
                "payoff":0,
                "remark":"无",
                "multiple":3
            },
            {
                "betAmount":300,
                "betContent":"豹子",
                "betCount":1,
                "playId":23201,
                "betMode":0,
                "chaseCount":1,
                "ifChase":0,
                "moneyMode":"y",
                "payoff":0,
                "remark":"无",
                "multiple":3
            },
            {
                "betAmount":300,
                "betContent":"半顺",
                "betCount":1,
                "playId":23204,
                "betMode":0,
                "chaseCount":1,
                "ifChase":0,
                "moneyMode":"y",
                "payoff":0,
                "remark":"无",
                "multiple":3
            }
        ],
        "amount":900,
        "lotteryId":48,
        "operType":0,
        "pcode":pCodeValue.pcode,
        "pdate":pCodeValue.pdate,
        "remark":"无",
        "source":"h5",
        "sourceType":"2"
      }
    betOrderAPI(body, lotteryPage.url);
  });
})
