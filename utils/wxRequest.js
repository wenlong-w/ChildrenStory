import { get, post } from "network.js"
import { hex_md5 } from "MD5.js"

export function doRequest() { }
export function beforeRequest() { }

function doRequest(url, param) {
  return new Promise((resolve, reject) => {
    param['timeMillis'] = new Date().getTime();
    param['token'] = hex_md5(param['timeMillis'] + 'waigxcx2018');
    let req = function () {
      beforeRequest(function (res) {
        if (url && url != "") {
          param.session = res.session;
          post(url, param).then(
            reqRes => {
              // console.log('doRequest reqRes', reqRes)
              if (reqRes.data && reqRes.data.result) {
                if (reqRes.data.relogin == "yes") {
                  wxLogin().then(
                    lgRes => {
                      req();
                    }
                  )
                } else {
                  resolve({ success: true, result: reqRes.data.value, message: reqRes.data.message });
                }
              } else {
                resolve({ success: false });
              }
            },
            reqErr => {
              // console.log('doRequest reqErr', reqErr);
              resolve({ success: false, result: reqErr });
            }
          );
        }
      });
    }
    req();
  });
}

/**
 * 后台请求前，检查session
 */
function beforeRequest(call) {
  wxHasCheckedSession().then(
    hcs => {
      if (hcs.success) {
        wxGetSession().then(
          skRes => {
            if (skRes.success) {
              call({ session: skRes.session });
            } else {
              wxLogin().then(
                lgRes => {
                  call({ session: lgRes.session });
                }
              )
            }
          }
        )
      } else {
        wxCheckSession().then(
          cs => {
            if (cs.success) {
              wxGetSession().then(
                skRes => {
                  if (skRes.success) {
                    call({ session: skRes.session });
                  } else {
                    wxLogin().then(
                      lgRes => {
                        call({ session: lgRes.session });
                      }
                    )
                  }
                }
              )
            } else {
              wxLogin().then(
                lgRes => {
                  call({ session: lgRes.session_key });
                }
              )
            }
          }
        );
      }
    }
  )
}

/**
 * 缓存里面是否还有 hasChecked
 */
function wxHasCheckedSession() {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key: 'has_checked_session',
      success: function (res) {
        resolve({ success: true });
      },
      fail: function (err) {
        // console.log(' has_checked_session err', err);
        resolve({ success: false });
      }
    })
  })
}

/**
 * 判断登录状态是否已经过期
 */
function wxCheckSession() {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success: function () {
        // console.log('登录没有过期')
        resolve({ success: true });
      },
      fail: function () {
        // console.log('登录过期')
        resolve({ success: false });
      }
    })
  });
}

/**
 * 检查缓存中是否还有sessionkey
 */
function wxGetSession() {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key: 'session_key',
      success: function (res) {
        resolve({ success: true, session: res.data });
      },
      fail: function (err) {
        console.log(' session_key err', err);
        resolve({ success: false });
      }
    })
  })
}

function wxLogin() {
  return new Promise((resolve, reject) => {
    // 登录
    wx.login({
      success: res => {
        console.log('res--:',res);
        wx.removeStorageSync('JSESSIONID')
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let dt = new Date().getTime();
        let token = hex_md5(dt + 'waigxcx2018');
        post("/ChildrenStory/UserInfoServlet.do", { methodName: 'codeForSession', code: res.code, timeMillis: dt, token: token }).then(
          res => {
            if (res.data.success) {
              // console.log('JSESSIONID:', res)
              wx.setStorageSync('session_key', res.data.session);
              wx.setStorageSync('has_checked_session', true);
              wx.setStorageSync('JSESSIONID', res.data.JSESSIONID);
              resolve({ success: true, session: res.data.session });
            } else {
              resolve({ success: false });
            }
          })
      },
      error: err => {
        console.log('login err:', err)
        resolve({ success: false });
      }
    })
  })
}