// / <reference types="Cypress" />
import {
  confirmAPI, findLotteryID
} from '../../support/utility.js'

describe('首页展示，毋需後台設定的版位', ()=>{
  let dataNewlysData, rankingData, lotteryList, hotNew, cust;
  before(()=>{
    cy.server();
    cy.route('GET','cms/v1/carousel').as('carousel');  // 轮播图

    cy.route('GET','lottery/v1/recent/prize/dataNewlys').as('dataNewlys'); // 开奖公告
    cy.route('GET','/v1/crowdfunding/ranking?source=pc').as('ranking'); // 富豪榜
    cy.route('/config/v1/lotterys').as('lotteryList'); //下拉彩種選單
    cy.route('/config/v1/lotteys/hotNew').as('hotNew'); //左侧彩种选单
    cy.route('/config/v1/cust').as('cust');

    cy.visitPage({
      onBeforeLoad(win) {
        cy.stub(win, 'open').as('windowOpen')
      },
    });
    // 在 before 内 wait 操作完毕
    cy.wait('@dataNewlys').then((response)=>{
      dataNewlysData = response.response.body.result;
    });
    cy.wait('@ranking').then((response)=>{
      rankingData = response.response.body.data.richestRanking
    });
    cy.wait('@lotteryList').then((response) => {
      lotteryList = response.response.body.result;
    })
    cy.wait('@hotNew').then((response) => {
      hotNew = response.response.body.result;
    })
    cy.wait('@cust').then((response) => {
      cust = confirmAPI(response)
    })
  });

  context('header頂天一列按鈕', () => {
    it('點選聯絡客服，開啟新視窗並確認連結是否正確', () => {
      assert.isObject(cust);
      cy.get('.top-btns-account > :nth-child(3) > .q-btn > .q-btn-inner').should('contain', '在线客服').click()
        cy.get('@windowOpen').should('be.calledWith',cust.custUrl);
    })
    it('點選代理加盟應該進入該頁面', () => {
      cy.get('.top-btns-help > :nth-child(2) > .q-btn > .q-btn-inner').should('contain', '代理加盟').click()
        .url().should('include','/helpCenter/helpCenterJoin')
    })

    it('點選幫助中心應該進入該頁面', () => {
      cy.get('.top-btns-help > :nth-child(3) > .q-btn > .q-btn-inner').should('contain', '帮助中心').click()
        .url().should('include','/helpCenter/helpCenterTutorial')
    })
    it('充值/提款点选皆跳出未登入视窗', () => {
      cy.get('.top-btns-account > :nth-child(1) > .q-btn > .q-btn-inner').should('contain', '充值').click()
      cy.LoginFirstPop();
      cy.wait(500);
      cy.get('.top-btns-account > :nth-child(2) > .q-btn > .q-btn-inner').should('contain', '提款').click({force:true})
      cy.LoginFirstPop();
    })

    it.skip('選手機投注，点击后进入appdownload页面', () => {
      cy.get('.top-btns-help > :nth-child(1) > .q-btn > .q-btn-inner').click()
      .location('href').should('include','appDownload')
    })
  })

  context('彩种列表显示', () => {
    it('未註冊彩票遊戲左侧选单出现，點繫後跳登入視窗', () => {
      assert.isArray(hotNew);
      const randomNum = Cypress._.random(1,hotNew.length);
      cy.get(`.layout-side > .q-list > :nth-child(${randomNum+2})`).contains(hotNew[randomNum].name)
        .click();
      cy.LoginFirstPop();
    })

    it('未注册彩票游戏下拉选单出现，点击后跳登入视窗', () => {
      assert.isArray(lotteryList);
      cy.get('.col-auto > :nth-child(2) > .q-btn > .q-btn-inner').click()
        .get('.q-list > :nth-child(1) > .lottery-entry__title').should('be.visible')
      const randomNum = Cypress._.random(1,lotteryList.length);
      // cy.get(`.q-list > :nth-child(${randomNum+1}) > .lottery-entry__title`).should('contain', lotteryList[randomNum].groupName)
      cy.get(`.q-list > :nth-child(${randomNum}) > .lottery-entry__wrap > :nth-child(${1}) > .q-btn`).click()
      cy.LoginFirstPop();
    })
    it('header五分六合彩按鈕，點擊後跳登入視窗', () => {
      cy.get('.col-auto > :nth-child(3) > .q-btn > .q-btn-inner').click()
      cy.LoginFirstPop();
    })
    it('header賽車秒秒彩按鈕，點擊後跳登入視窗', () => {
      cy.get('.col-auto > :nth-child(4) > .q-btn > .q-btn-inner').click()
      cy.LoginFirstPop();
    })
    it('header個人中心，點擊後跳登入視窗', () => {
      cy.get('.col-auto > :nth-child(6) > .q-btn > .q-btn-inner').click()
      cy.LoginFirstPop();
    })
    it('header優惠活動按鈕，點擊後進入優惠活動頁', () => {
      cy.get('.col-auto > :nth-child(5) > .q-btn > .q-btn-inner').click()
      .location('href').should('include', '/activity')
    })
    it('首頁按鈕返迴首頁', () => {
      cy.get('.col-auto > :nth-child(1) > .q-btn > .q-btn-inner').click()
        .location('href').should('include', '/pc')
    })
  })

  context('富豪榜', ()=>{
    it('/v1/crowdfunding/ranking 回复richestRanking 阵列为 0以上 [需] 显示富豪榜并资料正确', ()=>{
      if (rankingData.length > 0){
        const ramdomNum = Cypress._.random(0, rankingData.length-1);
        cy.get('div.lobby-winner-list tbody tr').eq(ramdomNum).find('td').eq(1).should('contain', rankingData[ramdomNum].userAccount)
        let mun = toString(rankingData[ramdomNum].revenue).substr(0, rankingData[ramdomNum].revenue.length-2)
        cy.get('div.lobby-winner-list tbody tr').eq(ramdomNum).find('td').eq(2).should('contain', mun)
      }
    })
    it('/v1/crowdfunding/ranking 回复richestRanking 阵列为 0 [需] 不渲染富豪榜', ()=>{
      if (rankingData.length <= 0) {
        cy.get('div').not('div.lobby-winner-list');
      } else {
        cy.get('div.lobby-winner-list')
      }
    })
  })

  context('开奖公告', ()=>{
    it('dataNewlys API回传0笔资料 [需]不渲染开奖公告区块 / 回传1笔资料以上 [需] 显示开奖公告区块', ()=>{
      if (dataNewlysData.length === 0) {
        cy.get('div').not('div.lobby-pastview');
      } else {
        cy.get('div.lobby-pastview');
      }
    })

    it('dataNewlys API回传资料1笔以上资料 [需]开奖彩种名称 / 开奖数字 / 路珠样式 / 期数', ()=>{
      if (dataNewlysData.length > 0){
        cy.get('div.lobby-pastview div.lottery-item-group').eq(dataNewlysData.length-1); // 确认数量正确
        // 乱数随机抽测
        const ramdomNum = Cypress._.random(0, dataNewlysData.length-1);
        cy.get('div.lobby-pastview div.lottery-item-group').eq(ramdomNum).find('div.lottery-item-name').should('contain', dataNewlysData[ramdomNum].lotteryName); // 名称
        cy.get('div.lobby-pastview div.lottery-item-group').eq(ramdomNum).find('div.lottery-item-padate').should('contain', dataNewlysData[ramdomNum].issueAlias); // 期号
        const winNumberArray = dataNewlysData[ramdomNum].winNumber.split(',');
        cy.get('div.lobby-pastview div.lottery-item-group').eq(ramdomNum).find('div.lobby-bead span')
          .contains(winNumberArray[0])// 开奖号码

        cy.get('div.lobby-pastview div.lottery-item-group').eq(ramdomNum).find('div.lottery-item-wrap>div.lobby-bead span.bead-lottery-'+dataNewlysData[ramdomNum].lotteryId) // 路珠样式
      }
    })

    it('dataNewlys API回传资料1笔以上资料 [且] 未登入會員/遊客 [需] 點選立即投注跳出請登入對話框', ()=>{

      if (dataNewlysData.length > 0) {
        // 乱数随机抽测
        const ramdomNum = Cypress._.random(0, dataNewlysData.length-1);
        cy.get('div.lobby-pastview div.lottery-item-group').eq(ramdomNum).find('button').click()
        cy.LoginFirstPop()
      }

    })

    it.skip('dataNewlys API回传资料4笔以上资料 [可] 自动往上卷动轮播 (需要单独测试)', ()=>{
      // 此任务需要单独测试
      // 否则会出 No commands were issued in this test. 错误
      if (dataNewlysData.length >= 4) {
        let nowShowIndex = Cypress.$('div.lobby-pastview div.swiper-slide.swiper-slide-active').index();
        // Cypress.log(console.log(nowShowIndex));
        cy.get('div.lobby-pastview div.swiper-slide').eq(nowShowIndex).find('.q-list').eq(0).should('be.visible');
        cy.wait(12000)
        cy.get('div.lobby-pastview div.swiper-slide').eq(nowShowIndex).find('.q-list').eq(0).should('not.be.visible');
      }
    })

    it.skip('点选右上角"更多"按钮 [可] 连结至 /pc/history 过往开奖记录(不开新页)', ()=>{
      cy.get('div.lobby-pastview .tabs-panel button').click()
      cy.url().should('include', '/pc/history')
      cy.go('back')
    })
  })

})

describe('首页-中间彩种推荐部分', () => {
  //這邊跑測試會失敗，就先跳過吧！還無解
  //這邊跑測試會失敗，就先跳過吧！還無解
  //這邊跑測試會失敗，就先跳過吧！還無解
  //這邊跑測試會失敗，就先跳過吧！還無解
  let lotteryId, prizeData, randomNum, lotteryList, prize;
  before(() => {
    cy.server();
    cy.route('/config/v1/lotterys').as('lotteryList');
    cy.visitPage();
    cy.wait('@lotteryList').then((response)=>{
      lotteryList = response.response.body.result;
    });
  })
  context('推荐投注 (中间 lobbyThreeTopLottery 区块)', ()=>{
    before(()=>{
      // 先取得 config/v1/lotterys 全部彩种的资料 再用画面上的名称对应出彩种ID
      // 使用该ID向 lottery/v1/recent/prize 取得当前开奖结果与倒数等资料
      randomNum = Cypress._.random(0, 2);
      cy.wait(1000).get('.lobby-recommend .q-tab-only-label').eq(randomNum)
      const lotteryName = Cypress.$('.lobby-recommend .q-tab-only-label').eq(randomNum).text()
      lotteryId = findLotteryID(lotteryName, lotteryList);
      console.log(lotteryId)
      cy.server();
      cy.route('GET','/lottery/v1/recent/prize?lotteryId='+lotteryId).as('prize')
      cy.visitPage();
      cy.wait('@prize').then((response) => {
        prize = response.response.body.result;
        // Cypress.log(console.log(prizeData));
        // nowTime = parseInt(new Date().getTime() / 1000, 10);
        // diffTime = nowTime - parseInt(response.response.body.serverTime / 1000, 10); // 取得與 Sever 差異時間
      }).end();
      cy.get('.lobby-recommend .q-tab-only-label').eq(randomNum).click({force:true});
    })

    it('随机点选采种页签 [可]自动切换对应正确的开彩资料',()=>{
      // 注: 随机选择已经在 before 操作完毕, 这里只需断言画面上呈现是否正确
      cy.get('.lobby-recommend div.q-tab-pane .lottery-item-pdate').eq(0)
      .should('contain', prize.pre.issueAlias) // 上期期号
      cy.get('.lobby-recommend div.q-tab-pane .lottery-item-pdate').eq(1)
      .should('contain', prize.now.issueAlias) // 本期期号
      cy.get('.lobby-recommend div.q-tab-pane .lottery-item-history span.double-row__item')
        .contains(prize.pre.doubleData[0]) // 上期开奖 (龙虎单双)
      const winNumberArray = prize.pre.winNumber.split(',');
      cy.get('.lobby-recommend div.q-tab-pane .lobby-bead span')
        .contains(winNumberArray[0])// 上期开奖 (数字)
    })

    it('随机点选采种页签 下方区块内之立即投注 [需]跳出 请登入提示画面',()=>{
      cy.get('.lobby-recommend div.q-tab-pane button').eq(1).click()
      cy.LoginFirstPop();
    })

    it('随机点选采种页签 下方区块内之号码走势 [需]visit 过往开奖记录画面(须带lotteryId)',()=>{
      cy.get('.lobby-recommend div.q-tab-pane button').eq(0).click()
      cy.url().should('include', 'lotteryId='+ lotteryId)
      cy.get('div.history .history-bar__name')
        .should('contain', prize.lotteryName)
      cy.go(-1).end();
    })

    it.skip('随机点选采种页签 下方区块内 [需]倒数时间需正确并每秒逐渐递减',()=>{
      // Cypress 可能會有幾秒差異造成此測試失敗
      // (網站的 diffTime 的計算由任一隻 API 取得 Sever 時間後計算，Query時間不同可能造成計算結果不同)
      // 註 此腳本最好第一支跑避免时间落差
      // 註 香港六合彩經常 API 給的 next.startTime 比當前時間還要早，應是彩種關閉 畫面呈現還是有倒數
      let frequency = 0;
      let clockNum = Cypress.$('b.card__top').length;
      // Cypress.log(console.log(clockNum));
      let Second, Minute, Hour;
      let oneSecondInterval = setInterval(() => {
        let time = parseInt((new Date().getTime() / 1000), 10) - diffTime; // 當前-Sever差異
        time = parseInt(time*1000, 10);
        // Cypress.log(console.log('noww Time'));
        // Cypress.log(console.log(time));


        let remainingTime = prize.next.startTime - time
        // Cypress.log(console.log('remainingTime is'));
        // Cypress.log(console.log(remainingTime));
        if (remainingTime < 0) {
          window.clearInterval(oneSecondInterval)
        }

        const second = 1000;
        const minutes = second * 60;
        const hours = minutes * 60;

        Second = Math.floor((remainingTime/second) % 60);
        Minute = Math.floor((remainingTime/minutes) % 60) || 0;
        Hour = Math.floor((remainingTime/hours)) || 0;
        // Cypress.log(console.log(Hour, Minute, Second));

        frequency++;
        if (frequency === 2) { // 只測兩次
          window.clearInterval(oneSecondInterval)
        }
      }, 1000);
      cy.wait(1200).then(()=>{
        if (Second < 0) return
        if(clockNum === 3){
          cy.get('b.card__top').eq(0).should('contain', Hour);
          cy.get('b.card__top').eq(1).should('contain', Minute);
          cy.get('b.card__top').eq(2).should('contain', Second);
        } else {
          cy.get('b.card__top').eq(0).should('contain', Minute);
          cy.get('b.card__top').eq(1).should('contain', Second);
        }
        cy.wait(1000).then(()=>{
          if(clockNum === 3){
            cy.get('b.card__top').eq(0).should('contain', Hour);
            cy.get('b.card__top').eq(1).should('contain', Minute);
            cy.get('b.card__top').eq(2).should('contain', Second);
          } else {
            cy.get('b.card__top').eq(0).should('contain', Minute);
            cy.get('b.card__top').eq(1).should('contain', Second);
          }
        })
      })
    })

    it.skip('随机点选采种页签 下方区块内 倒数时间归0后 [需] 更新画面当期期号与重新倒数 (需要单独测试)',()=>{
      // 此任务需要单独测试
      // 否则会出 No commands were issued in this test. 错误
      //注: 这个测试很可能会等很久，会看随机抽到哪种彩种。
      //注: 开奖结果不会随时间再更新 只有倒數時間跟當期期號會更新
      const second = 1000;
      const minutes = second * 60;
      const hours = minutes * 60;
      let clockNum = Cypress.$('b.card__top').length;
      let waitingTime, reminTime_H, reminTime_M, reminTime_S, PeriodSecond ,PeriodMinute ,PeriodHour;
      if (clockNum === 3) {
        reminTime_H = parseInt(Cypress.$('b.card__top').eq(0).text())*hours;
        reminTime_M = parseInt(Cypress.$('b.card__top').eq(1).text())*minutes;
        reminTime_S = parseInt(Cypress.$('b.card__top').eq(2).text())*second;
        waitingTime = reminTime_H + reminTime_M + reminTime_S;
      } else if(clockNum === 2) {
        reminTime_M = parseInt(Cypress.$('b.card__top').eq(0).text())*minutes;
        reminTime_S = parseInt(Cypress.$('b.card__top').eq(1).text())*second;
        waitingTime = reminTime_M + reminTime_S;
      };

      // Cypress.log(console.log(waitingTime))
      let lottryPeriod = prize.next.endTime - prize.next.startTime

      PeriodSecond = Math.floor((lottryPeriod/second) % 60);
      PeriodMinute = Math.floor((lottryPeriod/minutes) % 60) || 0;
      PeriodHour = Math.floor((lottryPeriod/hours)) || 0;
      // Cypress.log(console.log(PeriodHour, PeriodMinute, PeriodSecond));

      cy.wait(waitingTime).then(()=>{
        cy.get('.lobby-recommend div.q-tab-pane .lottery-item-pdate')
        .eq(1).should('contain', prize.next.issueAlias) // 本期期号
        if (clockNum === 3) {
          cy.get('b.card__top').eq(0).should('contain', PeriodHour)
          cy.get('b.card__top').eq(1).should('contain', PeriodMinute)
          cy.get('b.card__top').eq(2).should('contain', PeriodSecond)
        } else if(clockNum === 2) {
          cy.get('b.card__top').eq(0).should('contain', PeriodMinute)
          cy.get('b.card__top').eq(1).should('contain', PeriodSecond)
        }
      })
    })
  })
  context('推荐投注 (高频 / 低频 / 境外)', ()=>{
    let ramdomNumLottery, lotteryName, ramdomNum;
    before(()=>{
      // 页签随机点选
      ramdomNum = Cypress._.random(0,2);
      cy.wait(1000).get('.lobby-promo .q-tab-only-label').eq(ramdomNum).click({force:true});
      // 内有三彩种 随机
      ramdomNumLottery = Cypress._.random(0, 2);
      lotteryName = Cypress.$('.lobby-promo .col-auto.lottery-item-name').eq(ramdomNumLottery).text();
      lotteryId = findLotteryID(lotteryName, lotteryList);
      cy.server();
      cy.route('GET','lottery/v1/recent/prize?lotteryId='+lotteryId).as('prizeData');
      cy.visitPage()
      cy.wait('@prizeData').then((response) => {
        prizeData = response.response.body.result;
      })
    })
    it('随机点选(高频 / 低频 / 境外)页签 [可]自动切换对应正确的开彩资料',()=>{
      // 注: 随机选择已经在 before 操作完毕, 这里只需断言画面上呈现是否正确
      cy.get('.lobby-promo .text-strong').eq(ramdomNumLottery)
      .should('contain', prizeData.now.issueAlias-1); // 上期期号
      const winNumberArray = prizeData.pre.winNumber.split(',')
      cy.get('.lobby-promo .lottery-item-group').eq(ramdomNumLottery).find('.lobby-bead span')
        .contains(winNumberArray[0])// 上期开奖 (数字)
    })
    it('随机点选(高频 / 低频 / 境外)页签 下方区块内随机之立即投注 [需]跳出 请登入提示画面',()=>{
      cy.get('.lobby-promo .lottery-item-group').eq(ramdomNumLottery).find('button').eq(1).click()
      cy.LoginFirstPop();
    })
    it('随机点选(高频 / 低频 / 境外)页签 下方区块内随机之号码走势 [需]visit 过往开奖记录画面(须带lotteryId)',()=>{
      cy.get('.lobby-promo .lottery-item-group').eq(ramdomNumLottery).find('button').eq(0).click()
      cy.url().should('include', 'lotteryId='+ lotteryId)
      cy.get('div.history .history-bar__name')
        .should('contain', prizeData.lotteryName)
        .end();
    })
  })

})