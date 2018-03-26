import { doRequest } from '../../utils/wxRequest.js'

let app = getApp()
let globalBgAudioManager = app.globalBgAudioManager; //全局播放对象
let globalAudioListManager; //全局故事列表，包含：故事列表、当前播放的故事
let audioList = []; //故事列表
// console.log('page--',audioList.length);
let currentAudio; //当前播放的故事
let currentCollectIds = [];//当前已经收藏的故事数组

Page({
  initCurrentBgAudio: function (currentAudio){
  },
  data: {
    praiseDisplay: 'none',
    collectDisplay: 'none'
  },
  onReady: function (e) {
    // console.log('onready');
    globalAudioListManager = app.courseAudioListManager;
    audioList = globalAudioListManager.audioList;
    // console.log(',,,,',audioList.length);
    currentAudio = globalAudioListManager.currentAudio; //点击的故事
    // console.log('判断 当前音频',globalBgAudioManager.src);
    // console.log('paused  ',globalBgAudioManager.paused);
    if (globalBgAudioManager.src){
      if (globalBgAudioManager.paused){ //播放的故事暂停或终止了，进入页面就再次播放
        console.log('当前播放的音乐暂停了');
        this.currentAudioInfo();
      }else{
        console.log('当前有播放的音乐 忽略');
        let playFlag = 'none';
        let pauseFlag = '';
        if (globalBgAudioManager.src != currentAudio.audioUrl) {
          playFlag = '';
          pauseFlag = 'none';
        }
        this.setData({
          imgUrl: currentAudio.imgUrl,
          currentProcess: '00:00',
          totalProcess: '00:00',
          sliderMax: 100,
          sliderValue: 0,
          playNum: currentAudio.playNum,
          dt: currentAudio.dt,
          praiseNum: currentAudio.praiseNum,
          audioTitle: currentAudio.storyName,
          isMovingSlider: false,
          playAudioDisplay: playFlag,
          pauseAudioDisplay: pauseFlag,
        })
      }
    } else{
      // console.log('没有故事');
      this.currentAudioInfo();
    }

    globalBgAudioManager.onTimeUpdate(
      ()=>{
        // 在move的时候，不要更新进度条控件
        if (!this.data.isMovingSlider && globalBgAudioManager.src == currentAudio.audioUrl) {
          // console.log('全局src', globalBgAudioManager.src == currentAudio.audioUrl)
          
          this.setData({
            currentProcess: this.getAudioCurrentTime(),
            totalProcess: this.getAudioDuration(),
            sliderValue: Math.floor(globalBgAudioManager.currentTime),
            sliderMax: globalBgAudioManager.duration
          });
        }
      }
    )
    let self = this;
    globalBgAudioManager.onEnded(
      stopRes=>{
        self.toNextAudio();
        console.log('播放结束');
      }
    )
    
    this.getCollect();
  },

  getCollect: function(){
    doRequest('/ChildrenStory/UserCollectServlet.do', { id: currentAudio.id, methodName: 'findCollect' }).then(
      res => {
        if (res.success) {
          // console.log('findCollect ', res);
          let collects = res.result;
          let idsArr = collects.split(',');
          // console.log('idsArr ', idsArr);
          if (collects != '' && idsArr.length > 0) {
            currentCollectIds = idsArr;
          }

          let flag = false;
          let collectDisplay = 'none';
          let preCollectDisplay = '';
          for (let m = 0; m < idsArr.length; m++) {
            if (idsArr[m] == currentAudio.id) {
              // console.log('有重复');
              collectDisplay = '';
              preCollectDisplay = 'none';
              break;
            }
          }
          this.setData({
            collectDisplay: collectDisplay,
            preCollectDisplay: preCollectDisplay
          });
        }
      }
    )
  },
  
  /**
   * 当前页面需要播放故事的信息
   * 1、首次进入页面，播放音频
   * 2、点击播放上一首、下一首音频
   */
  currentAudioInfo: function(){
    console.log('currentAudio,', globalAudioListManager.currentAudio);
    // console.log('globalBgAudioManager,', globalBgAudioManager);
    wx.setNavigationBarTitle({
      title: globalAudioListManager.currentAudio.storyName
    })
    this.toPlayAudio();
    this.setData({
      imgUrl: currentAudio.imgUrl,
      currentProcess: '00:00',
      totalProcess: '00:00',
      sliderMax: 100,
      sliderValue: 0,
      playNum: currentAudio.playNum,
      dt: currentAudio.dt,
      praiseNum: currentAudio.praiseNum,
      audioTitle: currentAudio.storyName,
      audioSrc: currentAudio.audioUrl,
      isMovingSlider: false,
      playAudioDisplay: 'none',
      pauseAudioDisplay: '',
    })
  },
  toPreAudio: function(){
    // console.log('toPreAudio length',audioList.length)
    for (let index in audioList) {
      if (audioList[index].id == currentAudio.id) {
        index = index == 0 ? audioList.length - 1 : parseInt(index)-1;
        // index = parseInt(index);
        // console.log(index, typeof index)
        currentAudio = audioList[index];
        globalAudioListManager.currentAudio = currentAudio;
        // console.log(globalAudioListManager.currentAudio);
        break;
      }
    }
    this.getCollect();
    this.currentAudioInfo();
  },
  /**
   * 播放
   */
  toPlayAudio: function (e) {
    // globalBgAudioManager.src = this.data.audioSrc;
    this.setData({
      playAudioDisplay: 'none',
      pauseAudioDisplay: ''
    })
    currentAudio = globalAudioListManager.currentAudio;
    globalBgAudioManager.title = currentAudio.storyName;
    globalBgAudioManager.epname = currentAudio.storyName;
    globalBgAudioManager.singer = '糖豆妈妈';
    globalBgAudioManager.coverImgUrl = currentAudio.imgUrl;
    
    if (currentAudio.audioUrl == globalBgAudioManager.src) {
      console.log('xt');
      globalBgAudioManager.play();
    }else{
      globalBgAudioManager.src = currentAudio.audioUrl;
    }

    if (globalBgAudioManager.src != currentAudio.audioUrl){
      doRequest('/ChildrenStory/StoryServlet.do', { id: currentAudio.id, methodName: 'playAudio' }).then(
        playRes=>{
          if (playRes.success) {
            currentAudio.playNum = currentAudio.playNum + 1;
            this.setData({ playNum: currentAudio.playNum });
            for (var index in audioList) {
              if (audioList[index].id == currentAudio.id) {
                // console.log('赋值成功');
                audioList[index].playNum = currentAudio.playNum;
                // console.log('length', audioList.length);
                wx.setStorage({
                  key: 'audio_list',
                  data: JSON.stringify(audioList),
                })
                break;
              }
            }
          }
        }
      );
    }
  },
  toPauseAudio: function(){
    globalBgAudioManager.pause();
    this.setData({ 
      playAudioDisplay: '',
      pauseAudioDisplay: 'none'
    })
  },
  /**
   * 下一个音频故事
   */
  toNextAudio: function () {
    for (let index in audioList) {
      if (audioList[index].id == currentAudio.id) {
        index = index == audioList.length - 1 ? 0 : parseInt(index)+1;
        // console.log(index, typeof index)
        // console.log(index, typeof index)
        currentAudio = audioList[index];
        globalAudioListManager.currentAudio = currentAudio;
        // console.log(globalAudioListManager.currentAudio);
        break;
      }
    }
    this.getCollect();
    this.currentAudioInfo();
  },

  /**
   * 点赞
   */
  doPraise: function(){
    let currentAudio = globalAudioListManager.currentAudio;
    doRequest('/ChildrenStory/StoryServlet.do', { id: currentAudio.id, methodName:'doPraise'}).then(
      res=>{
        if(res.success){
          currentAudio.praiseNum = currentAudio.praiseNum + 1;
          this.setData({ praiseNum: currentAudio.praiseNum});
          for (var index in audioList) {
            if (audioList[index].id == currentAudio.id){
              audioList[index].praiseNum = currentAudio.praiseNum;
              break;
            }
          }
          wx.setStorage({
            key: 'audio_list',
            data: JSON.stringify(audioList),
          })
          // console.log(app.courseAudioListManager);
          wx.showToast({
            title: res.message,
            duration: 2000
          })
          this.setData({
            prePraiseDisplay:'none',
            praiseDisplay:''
          });
        }
      }
    );
  },
  /**
   * 收藏动作
   */
  doCollect: function () {
    let currentAudio = globalAudioListManager.currentAudio;
    // console.log('currentCollectIds', currentCollectIds);
    // console.log('dangqian', currentAudio);
    let flag = false;
    for(let i=0; i<currentCollectIds.length; i++){
      if(currentCollectIds[i]==currentAudio.id){
        flag = true;
        break;
      }
    }
    if(flag) return;
    let self = this;
    var fun = function(){
      currentCollectIds.unshift(currentAudio.id+'');
      let ids = '';
      for (let m = 0; m < currentCollectIds.length; m++){
        ids += currentCollectIds[m];
        if(m!=currentCollectIds.length-1){
          ids += ',';
        }
      }
      doRequest('/ChildrenStory/UserCollectServlet.do', { storyIds: ids, methodName: 'doCollect' }).then(
        res=>{
          // console.log('res', res);
          if(res.success){
            wx.showToast({
              title: res.message,
              duration: 2000
            })
            self.setData({
              preCollectDisplay: 'none',
              collectDisplay: ''
            });
          }
        }
      );
    }
    fun();
  },
  /**
   * 计算音频当前播放进度
   */
  getAudioCurrentTime: function () {
    var currentPlace = globalBgAudioManager.currentTime;
    return this.formatAudioTime(currentPlace);
  },
  /**
   * 计算音频总时间
   */
  getAudioDuration: function () {
    var durationPlace = globalBgAudioManager.duration;
    return this.formatAudioTime(durationPlace);
  },
  /**
   * 格式化音频播放时间
   */
  formatAudioTime: function (value) {
    //分钟  
    var minute = value / 60;
    var minutes = parseInt(minute);
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    //秒  
    var second = value % 60;
    var seconds = parseInt(second);
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var allTime = "" + minutes + "" + ":" + "" + seconds + ""
    return allTime;
  },
  /**
   * 完成一次拖动后触发的事件
   */
  hanleSliderChange: function (e) {
    const position = e.detail.value;
    this.seekCurrentAudio(position);
  },
  /**
   * 手动改变进度条后，音频随之改变
   */
  seekCurrentAudio: function (position) {
    const page = this;
    const pauseStatusWhenSlide = globalBgAudioManager.paused;
    if (pauseStatusWhenSlide) {
      globalBgAudioManager.play();
    }
    globalBgAudioManager.seek(Math.floor(position));

    // globalBgAudioManager.seek = seek(options) {
    //   wx.seekBackgroundAudio(options);  // 这样实现，就可以配置success回调了
    // } 


    // globalBgAudioManager.seek({
    //   position: Math.floor(position),
    //   success: () => {
    //     console.log('111 ok');
    // page.setData({
    //   currentProcess: this.formatAudioTime(position),
    //   sliderValue: Math.floor(position)
    // });
    //     if (pauseStatusWhenSlide) {
    //       globalBgAudioManager.pause();
    //     }
    //     console.log(`The process of the audio is now in ${globalBgAudioManager.currentTime}s`);
    //   },
    //   error:(err) => {
    //     console.log('111 error',err);
    //   }
    // });
  },
  handleSliderMoveStart: function () {
    this.setData({
      isMovingSlider: true
    });
  },
  handleSliderMoveEnd: function () {
    this.setData({
      isMovingSlider: false
    });
  },
  /**
   * 转发
   */
  onShareAppMessage: function (res) {
    console.log('转发回调', currentAudio)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '小故事：' + currentAudio.storyName,
      path: "pages/index/index",
      imageUrl: currentAudio.imgUrl,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  goBack: function(){
    // console.log('back');
    wx.navigateBack({
      delta: 1
    })
  }
})