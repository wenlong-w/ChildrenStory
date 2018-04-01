import { doRequest } from "./wxRequest.js";

//获取应用实例
const app = getApp()
const globalAudioListManager = app.courseAudioListManager;

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

/**
 * 时间戳转换为 2018-01016
 */
const stampFormatTime = stamp =>{
  var d = new Date(stamp);
  var years = d.getYear() + 1900;
  var month = add_zero(d.getMonth() + 1);
  var days = add_zero(d.getDate());
  return years + "-" + month + "-" + days ;
}

const add_zero = temp => {
  if (temp < 10) return "0" + temp;
  else return temp;
}

/**
 * 返回 2018-01-16
 */
const getDate = () =>{
  let now = new Date();
  let year = now.getFullYear();       //年
  let month = now.getMonth() + 1;     //月
  let day = now.getDate();            //日
  let clock = year + "-";
  if (month < 10)
    clock += "0";
  clock += month + "-";
  if (day < 10)
    clock += "0";
  clock += day;
  return clock;
}

const formatNumber = () => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const playAudio = () => {
  wx.navigateTo({
    url: '../playAudio/playAudio'
  })
}
const forwardStory = () => {
  console.log('forwardStory');
}
const getDiaryList = (callFun) => {
  let nowDate = getDate();
  let cacheDate; //缓存某天的日期 例如：2018-01-16
  let diaryList = [];
  try {
    cacheDate = wx.getStorageSync('now_date_praise');
    if (cacheDate) {
      // console.log("cacheDate:",cacheDate);
    }
  } catch (e) {

  }
  try {
    globalAudioListManager.diaryList = [];
    diaryList = wx.getStorageSync('diary_list');
    if (diaryList && diaryList != null && diaryList != 'null'
      && diaryList != 'undefined' && diaryList != undefined
      && diaryList != '') {
      diaryList = JSON.parse(diaryList);
    } else {
      diaryList = [];
    }
  } catch (e) {
    diaryList = [];
  }
  if (cacheDate == nowDate && diaryList.length > 0) {
    console.log('hc');
    for (let m = 0; m < diaryList.length; m++) {
      globalAudioListManager.diaryList.push(diaryList[m]);
    }
    callFun();
  } else {
    doRequest('/ChildrenStory/DiaryServlet.do', { methodName: 'findDiaryList' }).then(
      res => {
        // console.log('findDiaryList         res:', res);
        if (res.success) {
          let diaryList = res.result.diaryList;
          if (diaryList && diaryList.length > 0) {
            for (var i = 0; i < diaryList.length; i++) {
              diaryList[i].dt = stampFormatTime(diaryList[i].dt.time);
              globalAudioListManager.diaryList.push(diaryList[i]);
            }
            wx.setStorageSync('diary_list', JSON.stringify(diaryList));
            wx.setStorageSync('now_date_praise', nowDate);
            callFun();
          } 
        }
      }
    );
  }
}

const doPraise = ()=> {
  wx.navigateToMiniProgram({
    appId: 'wx18a2ac992306a5a4',
    path: 'pages/apps/largess/detail?accountId=586031',
    success(res) {
      // 打开成功
      console.log('res----', res);
    },
    fail(err) {
      // 打开成功
      console.log('err----', err);
    }
  })
}

/**
 * 将数据库中获取的imgUrl，通过file文件操作，换算得到imgFilePath，并且存储在audio_list里面
 */
const checkImgFileUrl = (storyList) => {
  let storyArr = [];
  storyList.forEach((story, index, storyList) => {
    if(story.imgFileUrl && story.imgFileUrl!==''){
      console.log('imgFileUrl：',story.imgFileUrl);
    } else {
      storyArr.push(toDownLoadFile(story));
    }
  });
  Promise.all(storyArr).then(
    allRes => {
      allRes.forEach((dlfResult, index) => {
        if (dlfResult.success){
          setLocalFile(dlfResult.story).then(
            lfRes => {
              storyArr[index] = lfRes;
              if (index === allRes.length -1){
                console.log('storyList', storyList);
                // console.log('storyArr', storyArr);
                wx.setStorageSync('audio_list', JSON.stringify(storyList));
              }
            }
          );
        }
      });
      
    }
  );
}

const setLocalFile = (story) => {
  return new Promise((resolve, reject) => {
    // console.log("story res", story);
    wx.saveFile({
      tempFilePath: story.tempFilePath,
      success: function (res) {
        // console.log("保持后的地址 res", res);

        // if (story.storyName === '小熊过桥' || story.storyName === '小马过河'){
        //   resolve({ success: false });
        // }else


        if (res.savedFilePath){
          story.imgFilePath = res.savedFilePath;
          resolve({success:true, story: story});
        } else {
          resolve({ success: false });
        }
      },
      fail: function (err) {
        console.log("保持后的地址  err", err);
        resolve({ success: false });
      }
    })
  });
}

/**
 * 根据url请求网络资源，得到一个临时路径
 */
const toDownLoadFile = (story) => {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: story.imgUrl,
      success: function (res) {

        // if (story.storyName === '白雪公主' || story.storyName === '小蚂蚁回家'){
        //   resolve({ success: false });
        // } else
        
        if (res.statusCode === 200) {
          story.tempFilePath = res.tempFilePath;
          resolve({ success: true, story: story});
        } else {
          resolve({ success: false});
        }
      },
      fail: function (err) {
        console.log("downloadFile err ", err);
        resolve({ success: false });
      }
    })
  });
}

module.exports = {
  formatTime: formatTime,
  playAudio: playAudio,
  forwardStory: forwardStory,
  getDate: getDate,
  stampFormatTime: stampFormatTime,
  doPraise: doPraise,
  getDiaryList: getDiaryList,
  checkImgFileUrl: checkImgFileUrl
}