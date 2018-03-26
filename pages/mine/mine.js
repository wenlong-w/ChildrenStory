import { doRequest } from '../../utils/wxRequest.js'
const util = require('../../utils/util.js');

//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    aboutOurView:'',
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  aboutOur: function(e){
   if (this.data.aboutOurView==''){
     this.setData({
       aboutOurView : 'none'
     });
     this.animation.opacity(1).height(120).step()
     this.setData({
       animationData: this.animation.export()
     })
   }else{
     this.setData({
       aboutOurView: ''
     });
     this.animation.opacity(0).height(0).step()
     this.setData({
       animationData: this.animation.export()
     })
   }
  },
  toDiaryBind: function(){
    util.getDiaryList(function () {
      wx.navigateTo({
        url: '../diary/diary'
      })
    });
  },
  toPraiseView: function(){
    util.doPraise();
  },
  aboutMe: function(){
    wx.navigateTo({
      url: './aboutMe/aboutMe'
    })
  },
  /**
   * 跳转到收藏
   */
  toCollectView: function (event) {
    wx.navigateTo({
      url: './collect/collect'
    })
  },
  /**
   * 跳转到足迹
   */
  toFootPrint: function (event) {
    wx.navigateTo({
      url: './footPrint/footPrint'
    })
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '我的'
    })
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })

    this.animation = animation
  },
  onLoad: function () {
    // console.log('app.userInfo ', app.userInfo);
    // console.log('this.data.canIUse ', this.data.canIUse);
    if (app.userInfo) {
      this.setData({
        userInfo: app.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        // console.log('res=====',res);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    // wx.getStorageSync(key)
    let self = this;
    wx.getStorage({
      key: 'you_find_me_date',
      success: function (res) {
        // console.log('缓存的：',res.data)
        let dtArr = res.data.split('-');
        self.setData({
          ourYear: dtArr[0],
          ourMonth: dtArr[1],
          ourDay: dtArr[2]
        });
      },
      fail: function(){
        console.log('接口');
        self.findDate();
      }
    })
  },
  findDate: function(){
    doRequest('/ChildrenStory/UserInfoServlet.do', {methodName: 'find' }).then(
      dtRes => {
        if (dtRes.success){
      
          let dt = util.stampFormatTime(dtRes.result.time);
          wx.setStorage({
            key: 'you_find_me_date',
            data: dt,
          })
          // console.log(dt);
          let dtArr = dt.split('-');
          this.setData({
            ourYear:dtArr[0],
            ourMonth:dtArr[1],
            ourDay:dtArr[2]
          });
        }
        // console.log('dtRes',dtRes);
        
      }
    );
  },
  getUserInfo: function (e) {
    // console.log('getUserInfo:666', e)
    
    if (e.detail.userInfo){
      app.userInfo = e.detail.userInfo;
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
      doRequest("/ChildrenStory/UserInfoServlet.do", { 
        methodName: 'save',
        avatarUrl: app.userInfo.avatarUrl,
        city: app.userInfo.city,
        country: app.userInfo.country,
        gender: app.userInfo.gender,
        language: app.userInfo.language,
        nickName: encodeURIComponent(app.userInfo.nickName),
        province: app.userInfo.province
       }, true).then(
        res => {
          console.log('rrres--',res);
        })
    }
  }
})
