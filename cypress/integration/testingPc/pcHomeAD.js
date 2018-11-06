// / <reference types="Cypress" />
import {
  findLotteryID
} from '../../support/utility.js'

describe.only('首页展示 (未登入)', ()=>{
  let carouselData, noticesData, viewData, activityData;
  before(()=>{
    cy.server();
    cy.route('GET','cms/v1/carousel').as('carousel');  // 轮播图
    cy.route('GET','cms/v1/notices').as('notices'); // 跑马灯
    cy.route('GET','cms/v1/floatFigure/view').as('view'); // 左右浮动广告

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
    cy.wait('@activity').then((response)=>{
      activityData = response.response.body.result;
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
        }
        if (node.link.length > 0) {
          cy.get('div.float-ad-left a').eq(index).should('have.attr', 'href', node.link)
        } else {
          cy.get('div.float-ad-left a').eq(index).should('have.attr', 'href', 'javascript:;')
          // 没有回传 Link 情况
        }
      });
      viewData.right.map((node, index) => {
        if (node.pictureKey) {
          cy.get('div.float-ad-right a').eq(index).find(`img[src*='${node.pictureKey}']`)
        }
        if (node.link.length > 0) {
          cy.get('div.float-ad-right a').eq(index).should('have.attr', 'href', node.link)
        } else {
          cy.get('div.float-ad-right a').eq(index).should('have.attr', 'href', 'javascript:;')
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

  context('活动 Banner 区块', ()=>{
    it('当 cms/v1/activity API 回传图片为皆无起讫时间 [需] 不渲染活动 Banner区块', ()=>{
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
      assert.isArray(activityData.list);
      if (activityData.list.length > 0) {
        activityData.list.forEach( (item,i) =>{
          if (activityData.list[i].beginTime){
            cy.get('.lobby-activity img[src*='+activityData.list[i].titlePic+']')
          }
        })
      }
    })

    it('当 cms/v1/activity API 回传图片为1张以上 [需] Banner区块内图片点选连结至优惠活动页面 /pc/activity', ()=>{
      if (activityData.list.length > 0) {
        cy.get('.lobby-activity .lobby-activity__img').eq(0).click()
        cy.url().should('include', '/pc/activity')
        cy.go('back')
      }
    })
  })

})