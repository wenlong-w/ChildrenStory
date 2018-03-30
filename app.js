import { beforeRequest } from 'utils/wxRequest.js'

App({
  onLaunch: function () {
    // console.log('onLaunch');
    /**
     * 首次进入小程序时，会检查用户的openid是否存在数据库中，并且把sessionkey传到前端
     */
    beforeRequest(
      res=>{
        
      }
    );
   
   
    // 获取用户信息
    wx.getSetting({
      success: res => {
        // console.log('getSetting   res:', res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // console.log('getUserInfo  res:', res)
              // 可以将 res 发送给后台解码出 unionId
              this.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            },
            error: err => {
              console.log('getUserInfo  error:', error)
            }
          })
        }
      },
      error: err => {
        console.log('getSetting err:', err)
      }
    })
  },
  courseAudioListManager: {
    currentAudio:{},
    audioList:[]
  },
  userInfo: null,
  globalBgAudioManager: wx.getBackgroundAudioManager()
})