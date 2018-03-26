//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');
import { get, post } from "../../utils/network.js"
import { doRequest } from "../../utils/wxRequest.js"

const globalAudioListManager = app.courseAudioListManager;

Page({
  onLoad: function (options) {
    
  },
  onShow: function(){
    wx.setNavigationBarTitle({
      title: '儿童故事每天听'
    })
    // console.log('onShow');
    globalAudioListManager.audioList = [];
    // console.log('oo', globalAudioListManager);
    let self = this;
    this.getStoryList(function (storyList) {

      // console.log('globalAudioListManager.audioList:', globalAudioListManager.audioList);
      self.setData({
        audioList: storyList
      });
    });
  },
  onShareAppMessage: function (res) {
    // console.log('转发回调',res)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    return {
      title: '儿童故事每天听',
      path: "pages/index/index",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  data: {
    imgUrls: [
      '../image/listenToMe.jpg',
      '../image/doPraise.jpg',
      '../image/diary.jpg'
      // '../image/listenToMe.jpg',
      // '../image/topPraise.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1200,
    audioList: [
      
    ]
  },
  topDo: function(e){
    if (e.target.id.indexOf('listenToMe')>0){
      wx.navigateTo({
        url: '../mine/aboutMe/aboutMe'
      })
    } else if (e.target.id.indexOf('doPraise') > 0) {
      util.doPraise();
    } else if (e.target.id.indexOf('diary') > 0) {
      util.getDiaryList(function(){
        wx.navigateTo({
          url: '../diary/diary'
        })
      });
    } 
  },
  /**
   * 获取audioList
   * 先从缓存获取audioList，缓存有并且不是今天set的，查后台；缓存无，查后台；否则直接用缓存数据
   */
  getStoryList: function (callFun){
    let nowDate = util.getDate();
    let cacheDate; //缓存某天的日期 例如：2018-01-16
    let audioList = [];
    try {
      cacheDate = wx.getStorageSync('now_date');
      if (cacheDate) {
        // console.log("cacheDate:",cacheDate);
      }
    } catch (e) {
      
    }
    try {
      audioList = wx.getStorageSync('audio_list');
      if (audioList && audioList != null && audioList != 'null'
        && audioList != 'undefined' && audioList != undefined
        && audioList != '') {
        audioList = JSON.parse(audioList);
        // console.log("缓存的audioList:", audioList);
      }else{
        audioList = [];
      }
    } catch (e) {
      audioList = [];
    }
    // cacheDate = 1;
    if (cacheDate == nowDate && audioList.length>0){
      // console.log('audioList直接用缓存的');
      for(let m=0; m<audioList.length; m++){
        globalAudioListManager.audioList.push(audioList[m]);
      }
      callFun(audioList);
    }else{
      // console.log('audioList 后台');
      doRequest('/ChildrenStory/StoryServlet.do', { methodName: 'findStoryList' }).then(
        res => {
          // console.log('audioList         res:', res);
          if (res.success) {
            let audioList = res.result.storyList;
            if (audioList && audioList.length > 0) {
              for (var i = 0; i < audioList.length; i++) {
                audioList[i].mode = "aspectFit";
                audioList[i].dt = util.stampFormatTime(audioList[i].dt.time);
                globalAudioListManager.audioList.push(audioList[i]);
              }
              wx.setStorageSync('audio_list', JSON.stringify(audioList));
              wx.setStorageSync('now_date', nowDate);
              callFun(audioList);
            } else {
              callFun([]);
            }
          } else {
            callFun([]);
          }
        }
      );
    }
  },
  onReady: function () {
    // Do something when page ready.
  },
  toPlayAudio: function (event) {
    let id = event.currentTarget.id;
    // console.log('audioList id:', globalAudioListManager.audioList);
    for (var audio of globalAudioListManager.audioList) {
      if(audio.id==id){
        globalAudioListManager.currentAudio = audio;
      }
    }
    util.playAudio();
  },
  toForward: function(){
    this.onShareAppMessage();
    // util.forwardStory();oooo

  },
  goPraise: function(){
    util.doPraise();
  }
})
