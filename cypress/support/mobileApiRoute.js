export const setApiRouteAlias = () => {
    cy.server();
    cy.route('/forseti/api/pay/receiptClient').as('payWay');
    cy.route('/forseti/api/pay/tradeList?searchType=1&*').as('accountInfo');
    cy.route('/forseti/api/payment/memberBank').as('memberBankInfo');
    cy.route('/forseti/api/playsTree*').as('lotteryGame');
    cy.route('/forseti/api/priodDataNewly?lotteryId=*').as('newPriod');
    cy.route('/forseti/api/priodDataNewlys?sideType=2').as('pastView');
    cy.route('/forseti/apid/cms/activity*').as('activity');
    cy.route('/forseti/apid/cms/carousel').as('carousel');
    cy.route('/forseti/apid/cms/copyright?type=3&code=AT01').as('deposit');
    cy.route('/forseti/apid/cms/msg/status?*').as('msgStatus');
    cy.route('/forseti/apid/cms/notices?*').as('cmsNotices');
    cy.route('/forseti/apid/cms/popText').as('popText');
    cy.route('/forseti/apid/cms/site').as('site');
    cy.route('/forseti/apid/config/appConfig').as('app');
    cy.route('/forseti/apid/config/custConfig').as('cust');
    cy.route('/forseti/apid/icons').as('hotGameIcon');
    cy.route('/forseti/apid/lotterys?*').as('lotteryList');
    cy.route('/forseti/apid/payment/banks').as('paymentBanks');
    cy.route('/hermes/api/balance/get?*').as('balance');
    cy.route('/uaa/apid/member/code/get?time=*').as('code');
    cy.route('/apid/serverCurrentTime*').as('sysTime');
    cy.route('/v1/crowdfunding/ranking').as('ranking');
    cy.route('/v1/crowdfunding/scrollwin').as('scrollWin');
    cy.route('GET', '/uaa/oauth/logout').as('logout');
    cy.route('POST', '/forseti/api/orders/orderList').as('betRecord');
    cy.route('POST', '/uaa/apid/member/login').as('userLogin');
    cy.route('POST', '/uaa/apid/member/testLogin').as('testLogin');
    cy.route('POST', '/forseti/api/orders/betOrder').as('betOrder');
};


export default setApiRouteAlias;
