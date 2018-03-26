const app = getApp()
// const util = require('../../../utils/util.js')
import { doRequest } from '../../../utils/wxRequest.js'
const globalAudioListManager = app.courseAudioListManager;
let audioList = []; //故事列表
let collectList = [];//已经收藏的故事列表

Page({
  toPlayAudio: function (event) {
    let id = event.currentTarget.id;
    for (var audio of collectList) {
      // console.log(audio);
      if (audio.id == id) {
        globalAudioListManager.currentAudio = audio;
      }
    }
    wx.navigateTo({
      url: '../../playAudio/playAudio'
    })
  } ,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('onload');
    collectList = [];
    audioList = globalAudioListManager.audioList;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    doRequest('/ChildrenStory/UserCollectServlet.do', { methodName: 'findCollect' }).then(
      res => {
        if (res.success) {
          // console.log('findCollect ', res);
          let collects = res.result;
          let idsArr = collects.split(',');
          // console.log('idsArr ', idsArr);
          let currentCollectIds = [];
          if (collects != '' && idsArr.length > 0) {
            currentCollectIds = idsArr;
          }
          
          for (let m = 0; m < currentCollectIds.length; m++) {
            for(let n=0; n<audioList.length; n++){
              if(currentCollectIds[m]==audioList[n].id){
                collectList.push(audioList[n]);
              }
            }
          }
          this.setData({ audioList: collectList });
        }
      }
    )
  },
  goBack: function () {
    // console.log('back');
    wx.switchTab({
      url: '../mine'
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '我的收藏'
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})