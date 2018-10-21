// / <reference types="Cypress" />
import {
  confirmAPI, roundAmt
} from '../../support/utility.js'

describe.skip('首頁header (未登入)', () => {
  context('首頁header試玩/logo欄位', () => {
    let code;
    before(() => {
      cy.server();
      cy.route('GET','/cms/v1/site').as('site');
      cy.route('GET','/member/v1/code').as('code');
      cy.visitPage();
      cy.wait('@code').then((response) => {
        code = confirmAPI(response);
      })
    });
    it('logo顯示/title顯示', () => {
      cy.wait('@site')
        .then((response) => {
          const {apistatus, result} =  response.response.body;
          expect(apistatus).to.eq(1);
          assert.isObject(result);
          cy.get('.brand-logo').invoke('attr','src').should('include', result.logoPic)
          cy.title().should('eq', result.name);
        })
        .end();
    })
    it('登入欄位/試玩登入/試玩登出', () => {
      cy.server();
      cy.route('POST','/member/v1/login/test').as('demoLogin');
      cy.route('POST','/member/v1/logout').as('demoLogout');
      //驗證登入欄位
      cy.get('.login-bar')
      .should('contain', '登录')
      .should('contain', '注册')
      .should('contain', '试玩')
      //驗證試玩登入
      cy.get('.btn-demoplay > .q-btn-inner').click();
      cy.wait('@demoLogin')
        .then((response) => {
          const {apistatus, result} = response.response.body;
          expect(apistatus).to.eq(1);
          assert.isObject(result);
          cy.get('.user-name > .q-btn > .q-btn-inner > div')
            .should('be.visible').and('contain', result.username);
          cy.get('.modal__header-title').contains('平台公告'); //檢查是否有平台公告自動跳窗
          cy.get('.modal--lobbypop').find('button').click({ multiple: true }); //關閉登入後的所有的自動跳窗
        })
      //驗證試玩登出
      cy.wait(500);
      cy.get('.user-name > .q-btn > .q-btn-inner > div').click()
        .get('.q-popover').should('be.visible') //彈跳視窗確認
      cy.get('.q-popover > .q-btn > .q-btn-inner').contains('登出').click()
      cy.wait('@demoLogout')
        .then((response) => {
          const {apistatus, result} = response.response.body;
          expect(apistatus).to.eq(1);
          cy.get('.login-bar')
            .should('contain', '登录')
            .should('contain', '注册')
            .should('contain', '试玩')
        }).end()
    })

  })

  context('首頁user 登入/登出正常', () => {
    let code;
    before(() => {
      cy.server();
      cy.route('GET','/member/v1/code').as('code');
      cy.visitPage();
      cy.wait('@code').then((response) => {
        code = confirmAPI(response);
      })
    });

    it('首页上方登入，输入正确后显示登录状态，且验证余额是否正确，且可正常登出/ 首页上方登入后，点选会员帐号，可登出', () => {
      cy.server();
      cy.route('POST','/member/v1/login').as('userLogin');
      cy.route('GET', '/cms/v1/popText').as('popup');
      cy.route('POST','/member/v1/logout').as('userLogout');
      // login start
      const body = {
        "apiKey":"d4bcc79d9888957",
        "base64Image":`data:image/png;base64,${code.code}`,
      }
      cy.request({
        method: 'POST',
        url: 'https://api.ocr.space/parse/image',
        form: true,
        body,
      }).then((res) => {
        const codeText= res.body.ParsedResults[0].ParsedText.replace(/[a-zA-Z]|[\s]/g, '');
        cy.get('.q-list > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type('ddtest01');
        cy.get('.q-list > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type('abc1234');
        cy.get('.q-list > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(codeText? codeText: 1111);
        cy.get(':nth-child(4) > .btn-primary').click().end()
      })
      // login end

      cy.wait('@userLogin').then((response)=>{
        const {apistatus, result} = response.response.body;
        if( apistatus === 1){
          expect(apistatus).to.eq(1);
          assert.isObject(result);
          const memberBalance = roundAmt(result.balance);
          cy.get('.user-name > .q-btn > .q-btn-inner > div')
            .should('be.visible').and('contain', result.username);
          cy.wait('@popup').then((response) => {
            cy.get('.modal--lobbypop').then(() => {
              const {apistatus, result} = response.response.body;
              expect(apistatus).to.eq(1);
              assert.isObject(result);
              cy.get('.modal--lobbypop > .modal-content').contains(result.list[0].title);
              cy.get('.modal--lobbypop > .modal-content > .modal__header > .q-btn > .q-btn-inner > .q-icon').click();
              cy.wait(500);
              // 验证余额
              cy.get('.q-list > :nth-child(2) > .user-purse > .user-purse__balance > .q-btn > .q-btn-inner')
                .contains('显示')
                .click()
                .get('.q-list > :nth-child(2) > .user-purse > .user-purse__balance > .user-purse-amt')
                .contains(memberBalance)
                .end();

              //登出流程
              cy.get('.user-name > .q-btn > .q-btn-inner > div').click()
                .get('.q-popover > .q-btn > .q-btn-inner').contains('登出').click().end();
              cy.wait('@userLogout').then((response) => {
                const {apistatus, result} = response.response.body;
                expect(apistatus).to.eq(1);
                assert.isBoolean(result);
                cy.get('.login-bar')
                .should('contain', '登录')
                .should('contain', '注册')
                .should('contain', '试玩').end();
              })
            })
          })
        } else {
          cy.wait(500).get('.modal-content')
            .contains('.modal__footer','关闭' )
            .find('.q-btn')
            .click().end();
        }
      })

    })

  })

  context('header頂天一列按鈕', () => {
    before(() => {
      cy.server();
      cy.route('/config/v1/cust').as('cust');
      cy.visitPage({
        onBeforeLoad(win) {
          cy.stub(win, 'open').as('windowOpen')
        },
      });
    })
    it('點選聯絡客服，開啟新視窗並確認連結是否正確', () => {
      cy.wait('@cust').then((response) => {
        const {apistatus, result} = response.response.body;
        expect(apistatus).to.eq(1);
        assert.isObject(result);
        cy.get('.top-btns-account > :nth-child(3) > .q-btn > .q-btn-inner').should('contain', '在线客服').click()
        cy.get('@windowOpen').should('be.calledWith',result.custUrl);
      })
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

  context('header彩種列表顯示', () => {
    before(() => {
      cy.server();
      cy.route('/config/v1/lotterys').as('lotteryList');
      cy.route('/config/v1/lotteys/hotNew').as('hotNew');
      cy.visitPage();
    });
    it('未註冊彩票遊戲（左側及headerbar)列表出現，點繫後跳登入視窗', () => {
      cy.wait('@hotNew')
        .then((response) => {
          const {apistatus, result} = response.response.body;
          expect(apistatus).to.eq(1);
          assert.isArray(result);
          const randomNum = Cypress._.random(1,result.length);
          cy.get(`.layout-side > .q-list > :nth-child(${randomNum+2})`).contains(result[randomNum].name)
            .click();
          cy.LoginFirstPop();
        })
      cy.wait('@lotteryList')
        .then( (response) => {
          const {apistatus, result} = response.response.body;
          expect(apistatus).to.eq(1);
          assert.isArray(result);
          cy.get('.col-auto > :nth-child(2) > .q-btn > .q-btn-inner').click()
            .get('.q-list > :nth-child(1) > .lottery-entry__title').should('be.visible')
          const randomNum = Cypress._.random(1,result.length);
          cy.get(`.q-list > :nth-child(${randomNum+1}) > .lottery-entry__title`).should('contain', result[randomNum].groupName)
          cy.get(`.q-list > :nth-child(${randomNum}) > .lottery-entry__wrap > :nth-child(${1}) > .q-btn`).click()
          cy.LoginFirstPop();
        })
    })
    it('首頁按鈕返迴首頁', () => {
      cy.get('.col-auto > :nth-child(1) > .q-btn > .q-btn-inner').click()
        .location('href').should('include', '/pc')
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
    it('点选免费注册后，要导向注册页', () => {
      cy.get('.btn-reg > .q-btn-inner').contains('免费注册').click()
        .location('href').should('include', '/reg')
    })
  })

})

describe('首页 (未登入)', ()=>{
  let nowTime, diffTime ,carouselData, noticesData, viewData, dataNewlysData, lotteryList, activityData;
  before(()=>{
    cy.server();
    cy.route('GET','cms/v1/carousel').as('carousel');  // 轮播图
    cy.route('GET','cms/v1/notices').as('notices'); // 跑马灯
    cy.route('GET','cms/v1/floatFigure/view').as('view'); // 左右浮动广告
    cy.route('GET','lottery/v1/recent/prize/dataNewlys').as('dataNewlys'); // 开奖公告
    cy.route('GET','config/v1/lotterys').as('allLotterys'); // 所有彩种ID 文字 资料
    cy.route('GET','cms/v1/activity').as('activity'); // 活动 Banner

    cy.visitPage();
    
    // 在 before 内 wait 操作完毕
    cy.wait('@carousel').then((response)=>{
      carouselData = response.response.body.result;
    });
    cy.wait('@notices').then((response)=>{
      noticesData = response.response.body.result;
    });
    cy.wait('@view').then((response)=>{
      viewData = response.response.body.result;
    });
    cy.wait('@dataNewlys').then((response)=>{
      dataNewlysData = response.response.body.result;
    });
    cy.wait('@allLotterys').then((response)=>{
      lotteryList = [];
      response.response.body.result.forEach((group, groupIndex) => {
        group.lotterys.map((lottery) => {
          lottery.groupIndex = groupIndex;
          lotteryList.push(lottery);
        })
      });
      Cypress.log(console.log(lotteryList))
      // 用回圈整理一下 config/v1/lotterys 回传的资料
    });
    cy.wait('@activity').then((response)=>{
      activityData = response.response.body.result;
      nowTime = parseInt(new Date().getTime() / 1000, 10);
    });

  });
  context('首页轮播图', ()=>{
    it('carouselAPI 回传 0 张图片时 [需]不渲染轮播图区块 / 1张以上时 [需]显示轮播图区块', ()=>{
      assert.isObject(carouselData);
      if(carouselData.list.length <= 0 ){
        cy.get('div').not('div.layout-carousel');
      } else {
        cy.get('div.layout-carousel div.relative-position').eq(carouselData.list.length-1);
      }
    });

    it('carouselAPI 回传1张以上图片连结资料 [需]图片与连结正确', ()=>{
      if (carouselData.list.length > 0) {
        // 乱数检查图片/连结是否正确
        const ramdomNum = Cypress._.random(0, carouselData.list.length-1);
        cy.get('div.layout-carousel div.relative-position').eq(ramdomNum).find(`img[src*='${carouselData.list[ramdomNum].titlePic}']`)
        cy.get('div.layout-carousel div.relative-position').eq(ramdomNum).find('a').should('have.attr','href',carouselData.list[ramdomNum].link)
      }
    })
    it('carouselAPI 回传两张图以上 [可]左右切换', ()=>{
      if (carouselData.list.length > 1) {
        cy.get('div.layout-carousel').find('button.q-carousel-left-arrow, button.q-carousel-right-arrow').should('be.visible')
        // 是检查点选往右btn 图片切换
        let nowShowIndex = Cypress.$('div.layout-carousel div.relative-position').index();
        cy.get('div.layout-carousel').find('button.q-carousel-right-arrow').click()
        cy.wait(500)
        cy.get('div.layout-carousel div.relative-position')
        .eq(nowShowIndex).should('not.be.visible')
        cy.get('div.layout-carousel div.relative-position')
        .eq(nowShowIndex+1 === carouselData.list.length ? nowShowIndex-1: nowShowIndex+1).should('be.visible')
      }
    })
  });

  context('首页跑马灯', ()=>{
    it('noticesAPI 回传0笔资料 [需]不渲染跑马灯区块 / 回传1笔资料以上 [需]显示跑马灯区块', ()=>{

      assert.isArray(noticesData.list);
      if (noticesData.list.length === 0) {
        cy.get('div').not('div.lobby-marquee');
      } else {
        cy.get('div.lobby-marquee');
      }

    })

    it('noticesAPI 回传资料一笔以上 [需]文字正确出现', ()=>{
      if (noticesData.list.length > 0) {
        const ramdomNum = Cypress._.random(0, noticesData.list.length-1);
        cy.get('div.lobby-marquee marquee').should('contain', noticesData.list[ramdomNum].content);
      }
    })
  });

  context('首页左右浮动广告', ()=>{
    it('viewAPI回传 list内无资料 [需] 不渲染浮动广告区块', ()=>{
      assert.isObject(viewData);
      if(viewData.left.length){
        cy.get('div').not('div.float-ad-left');
      } else {
        cy.get('div.float-ad-left');
      }
      if(viewData.right.length){
        cy.get('div').not('div.float-ad-right');
      } else {
        cy.get('div.float-ad-right');
      }

    })

    it('viewAPI回传 list内两阵列图片 pictureKey 4张全皆为空字串 [需] 不渲染浮动广告区块', ()=>{
        let leftImgUrl  = viewData.left.map((node, index) => {
          return node.pictureKey || ''
        });

        let rightImgUrl  = viewData.left.map((node, index) => {
          return node.pictureKey || ''
        });

        if(!leftImgUrl.join('')){
          cy.get('div').not('div.float-ad-left');
        }

        if(!rightImgUrl.join('')){
          cy.get('div').not('div.float-ad-right');
        }
    })

    it('viewAPI回传资料 [需]正确显示图片与连结', ()=>{
      viewData.left.map((node, index) => {
        if (node.pictureKey) {
          cy.get('div.float-ad-left a').eq(index).find(`img[src*='${node.pictureKey}']`)
        } else {
          cy.get('div.float-ad-left a').eq(index).should('not.be.visible')
        }
        if (node.link.length > 0) {
          cy.get('div.float-ad-left a').eq(index).should('have.attr', 'href', node.link)
        } else {
          cy.get('div.float-ad-left a').eq(index).should('have.attr', 'href', '#')
        }
      });
      viewData.right.map((node, index) => {
        if (node.pictureKey) {
          cy.get('div.float-ad-right a').eq(index).find(`img[src*='${node.pictureKey}']`)
        } else {
          cy.get('div.float-ad-right a').eq(index).should('not.be.visible')
        }
        if (node.link.length > 0) {
          cy.get('div.float-ad-right a').eq(index).should('have.attr', 'href', node.link)
        } else {
          cy.get('div.float-ad-right a').eq(index).should('have.attr', 'href', '#')
        }
      })
    });

    it('viewAPI回传 pictureKey有图片资料 [可]按下方关闭纽关闭广告',()=>{
        let leftImgUrl  = viewData.left.map((node, index) => {
          return node.pictureKey || ''
        });

        let rightImgUrl  = viewData.right.map((node, index) => {
          return node.pictureKey || ''
        });

        if(leftImgUrl.join('')){
          cy.get('div.float-ad-left');
          cy.get('div.float-ad-left button').find('img[src*="close"]')
          cy.get('div.float-ad-left button').click();
          cy.get('div.float-ad-left').should('not.be.visible')
        }

        if(rightImgUrl.join('')){
          cy.get('div.float-ad-right');
          cy.get('div.float-ad-right button').find('img[src*="close"]')
          cy.get('div.float-ad-right button').click();
          cy.get('div.float-ad-right').should('not.be.visible')
        }

    })
  });

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

        dataNewlysData[ramdomNum].winNumber.split(',').map((node, index) => {
          cy.get('div.lobby-pastview div.lottery-item-group').eq(ramdomNum).find('div.lobby-bead span').eq(index).should('contain',dataNewlysData[ramdomNum].winNumber.split(',')[index]);
          // 开奖号码
        })

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

    it('dataNewlys API回传资料4笔以上资料 [可] 自动往上卷动轮播', ()=>{
      if (dataNewlysData.length >= 4) {
        let nowShowIndex = Cypress.$('div.lobby-pastview div.swiper-slide.swiper-slide-active').index();
        cy.get('div.lobby-pastview div.swiper-slide').eq(nowShowIndex).find('.q-list').eq(0).should('be.visible');
        cy.wait(12000)
        cy.get('div.lobby-pastview div.swiper-slide').eq(nowShowIndex).find('.q-list').eq(0).should('not.be.visible');
      }
    })

    it('点选右上角"更多"按钮 [可] 连结至 /pc/history 过往开奖记录(不开新页)', ()=>{
      cy.get('div.lobby-pastview .tabs-panel button').click()
      cy.url().should('include', '/pc/history')
    })
  })

  context.only('推荐投注 (中间 lobbyThreeTopLottery 区块)', ()=>{
    let lotteryId, prizeData, ramdomNum;
    before(()=>{
      // 先取得 config/v1/lotterys 全部彩种的资料 再用画面上的名称对应出彩种ID
      // 使用该ID向 lottery/v1/recent/prize 取得当前开奖结果与倒数等资料
      ramdomNum = Cypress._.random(0, Cypress.$('.lobby-recommend .q-tab-only-label').length-1);
      let lotteryName = Cypress.$('.lobby-recommend .q-tab-only-label').eq(ramdomNum).text()
      for(let i = 0; i < lotteryList.length ;i++){
        if (lotteryName === lotteryList[i].name) {
          lotteryId = lotteryList[i].id
        }
      }
      Cypress.log(console.log(lotteryId))

      cy.server();
      cy.route('GET','lottery/v1/recent/prize?lotteryId='+lotteryId).as('prizeData')
      cy.visitPage();
      cy.wait('@prizeData').then((response) => {
        prizeData = response.response.body.result;
        cy.get('.lobby-recommend .q-tab-only-label').eq(ramdomNum).click()
        diffTime = nowTime - parseInt(response.response.body.serverTime / 1000, 10); // 取得與 Sever 差異時間
      })
    })
    it('随机点选采种页签 下方区块内 [需]倒数时间需正确并每秒逐渐递减',()=>{
      // Cypress 可能會有一秒差異造成此測試失敗
      // 註 此腳本最好單獨跑(或第一支跑)
      let frequency = 0;
      let clockNum = Cypress.$('b.card__top').length;
      Cypress.log(console.log(clockNum));
      let Second, Minute, Hour;
      let oneSecondInterval = setInterval(() => {
        let time = parseInt((new Date().getTime() / 1000), 10) - diffTime; // 當前-Sever差異
        time = parseInt(time*1000, 10);

        //let remainingTime_ = prizeData.next.startTime - Date.now()
        let remainingTime = prizeData.next.startTime - time

        // Cypress.log(console.log(remainingTime, remainingTime_));
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
    it('随机点选采种页签 [可]自动切换对应正确的开彩资料',()=>{
      // 注: 随机选择已经在 before 操作完毕, 这里只需断言画面上呈现是否正确
      cy.get('.lobby-recommend div.q-tab-pane .lottery-item-pdate').eq(0)
      .should('contain', prizeData.now.issueAlias-1) // 上期期号
      cy.get('.lobby-recommend div.q-tab-pane .lottery-item-pdate').eq(1)
      .should('contain', prizeData.now.issueAlias) // 本期期号
      for(let i = 0 ; i < prizeData.pre.doubleData.length; i++ ) {
        cy.get('.lobby-recommend div.q-tab-pane .lottery-item-history span.double-row__item')
        .eq(i).should('contain',prizeData.pre.doubleData[i]) // 上期开奖 (龙虎单双)
      }
      const winNumberArray = prizeData.pre.winNumber.split(',')
      for(let i = 0 ; i < winNumberArray.length; i++ ) {
        cy.get('.lobby-recommend div.q-tab-pane .lobby-bead span')
        .eq(i).should('contain',winNumberArray[i]) // 上期开奖 (数字)
      }
    })

    it('随机点选采种页签 下方区块内之号码走势 [需]visit 过往开奖记录画面(须带lotteryId)',()=>{
      cy.get('.lobby-recommend div.q-tab-pane button').eq(0).click()
      cy.url().should('include', 'lotteryId='+ lotteryId)
      cy.get('div.history .history-bar__name')
      .should('contain', prizeData.lotteryName)
      // 因不是重整 所以这边要手动帮他回上一页...
      cy.go('back')
      cy.get('.lobby-recommend .q-tab-only-label').eq(ramdomNum).click()
    })

    it('随机点选采种页签 下方区块内之立即投注 [需]跳出 请登入提示画面',()=>{
      cy.get('.lobby-recommend div.q-tab-pane button').eq(1).click()
      cy.LoginFirstPop();
    })



    /*it('随机点选采种页签 下方区块内 [需]倒数时间归0后，更新画面当期期号与重新倒数',()=>{
      //注: 这个测试很可能会等很久，会看随机抽到哪种彩种。
      //注: 开奖结果不会随时间再更新 只有倒數時間跟當期期號會更新

    })*/
  })

  context('推荐投注 (高频 / 低频 / 境外)', ()=>{
    let lotteryId, prizeData, ramdomNum, ramdomNumLottery;
    before(()=>{
      // 页签随机点选
      ramdomNum = Cypress._.random(0, Cypress.$('.lobby-promo .q-tab-only-label').length-1);
      cy.get('.lobby-promo .q-tab-only-label').eq(ramdomNum).click();
      // 内有三彩种 随机
      ramdomNumLottery = Cypress._.random(0, Cypress.$('.lobby-promo .lottery-item-group').length-1);
      let lotteryName = Cypress.$('.lobby-promo .col-auto.lottery-item-name').eq(ramdomNumLottery).text();

      Cypress.log(console.log(lotteryName));
      for(let i = 0; i < lotteryList.length ;i++){
        if (lotteryName === lotteryList[i].name) {
          lotteryId = lotteryList[i].id;
        }
      }
      Cypress.log(console.log(lotteryId));

      cy.server();
      cy.route('GET','lottery/v1/recent/prize?lotteryId='+lotteryId).as('prizeData_')
      cy.visitPage();
      cy.wait('@prizeData_').then((response) => {
        prizeData = response.response.body.result;
        Cypress.log(console.log(prizeData));
      })
    })
    it('随机点选(高频 / 低频 / 境外)页签 [可]自动切换对应正确的开彩资料',()=>{
      // 注: 随机选择已经在 before 操作完毕, 这里只需断言画面上呈现是否正确
      cy.get('.lobby-promo .text-strong').eq(ramdomNumLottery)
      .should('contain', prizeData.now.issueAlias-1); // 上期期号
      const winNumberArray = prizeData.pre.winNumber.split(',')
      for(let i = 0 ; i < winNumberArray.length; i++ ) {
        cy.get('.lobby-promo .lottery-item-group').eq(ramdomNumLottery).find('.lobby-bead span')
        .eq(i).should('contain',winNumberArray[i]) // 上期开奖 (数字)
      }
    })
    it('随机点选(高频 / 低频 / 境外)页签 下方区块内随机之号码走势 [需]visit 过往开奖记录画面(须带lotteryId)',()=>{
      cy.get('.lobby-promo .lottery-item-group').eq(ramdomNumLottery).find('button').eq(0).click()
      cy.url().should('include', 'lotteryId='+ lotteryId)
      cy.get('div.history .history-bar__name')
      .should('contain', prizeData.lotteryName)
      // 因不是重整 所以这边要手动帮他回上一页...
      cy.go('back')
      cy.get('.lobby-recommend .q-tab-only-label').eq(ramdomNum).click()
    })
    it('随机点选(高频 / 低频 / 境外)页签 下方区块内随机之立即投注 [需]跳出 请登入提示画面',()=>{
      cy.get('.lobby-promo .lottery-item-group').eq(ramdomNumLottery).find('button').eq(1).click()
      cy.LoginFirstPop();
    })
  })

  context('活动 Banner 区块', ()=>{
    it('当 cms/v1/activity API 回传图片为皆无起讫时间 [需] 不渲染活动 Banner区块', ()=>{
      Cypress.log(console.log(activityData))
      assert.isArray(activityData.list);
      let haveTimedata = false;
      activityData.list.map((node, index)=>{
        if (node.beginTime) {
          haveTimedata = true;
        }
      })
      if (!haveTimedata || activityData.list.length === 0) {
        cy.get('div').not('div.lobby-activity');
      }
    })

    it('当 cms/v1/activity API 回传图片为1张以上有起讫时间 [需] 显示 Banner区块 [且] 图片连结路径正确', ()=>{
      if (activityData.list.length > 0) {
        for( let i = 0 ; i < activityData.list.length ; i++){
          if (activityData.list[i].beginTime){
            cy.get('.lobby-activity img[src*='+activityData.list[i].titlePic+']')
          } else {
            continue
          }
        }
      }
    })

    it('当 cms/v1/activity API 回传图片为1张以上 [需] Banner区块内图片点选连结至优惠活动页面 /pc/activity', ()=>{
      if (activityData.list.length > 0) {
        cy.get('.lobby-activity .lobby-activity__img').eq(0).click()
        cy.url().should('include', '/pc/activity')
      }
    })
  })
})

describe.skip('首页 (游客)', ()=>{
  context('开奖公告', ()=>{
    beforeEach(() => {
      cy.server();
      cy.route('GET','lottery/v1/recent/prize/dataNewlys').as('dataNewlys'); // 开奖公告
      cy.visitPage();
      cy.demoLogin(); // 登入遊客
    })
    it('dataNewlys API回传资料1笔以上资料 [且] 已登入遊客 [需] 點選立即投注連結至正確頁面', ()=>{
      cy.wait('@dataNewlys').then((response) =>{
        const {result} = response.response.body;
        if (result.length > 0) {
          // 乱数随机抽测
          const ramdomNum = Cypress._.random(0, result.length-1);
          cy.get('div.lobby-pastview div.lottery-item-group').eq(ramdomNum).find('button').click()
          // 检查页面 Title中文字是否正确
          cy.get('div.layout-main span.lottery-title__name').should('contain', result[ramdomNum].lotteryName)
        }
      })
    })
  })
})