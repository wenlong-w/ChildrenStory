/**
 * Created by 23hp on 2017/4/13.
 * 基于Promise的网络<strong><font color="#FF0000">请求</font></strong>库,包含GET POST请求，上传下载功能
 * 使用方法：
 * 先引入： import {get,post,...} from 本文件;
 * · get请求:    get("/index",{id:2}).then(function(succeedData){},function(failedData){});
 * · post请求:    post("/index",{id:2}).then(function(succeedData){},function(failedData){});
 *  then方法里的参数第一个是成功回调，第二个是失败回调，两个回调都是可选的
 */

/**
 * 服务器根路径
 * todo  替换成你自己的
 * @type {string}
 */
export let rootUrl = "https://www.wenyansoft.com";
// export let rootUrl = "http://127.0.0.1:8080";

/**
 * 发送get 请求
 * @param relativeUrl 相对路径
 * @param param 参数，可选
 * @param showLog 是否打印日志
 * @param showLoading 是否显示加载框
 * @param showError 是否显示错误框
 * @returns {Promise}
 */
export function get(relativeUrl, param = {}) {
  return request("GET", relativeUrl, param);
}
/**
 * 发送POST请求
 * @param relativeUrl 相对路径
 * @param param 参数，可选
 * @param showLog 是否打印日志
 * @param showLoading 是否显示加载框
 * @param showError 是否显示错误框
 * @returns {Promise}
 */
export function post(relativeUrl, param = {}) {
  return request("POST", relativeUrl, param);
}

/**
 * 接口请求基类方法
 * @param method 请求方法
 * @param relativeUrl 相对路径
 * @param param 参数，可选
 * @param showLog 是否打印日志
 * @param showLoading 是否显示加载框
 * @param showError 是否显示错误框
 * @returns {Promise}
 */
function request(method = "GET", relativeUrl, param = {}) {
  return new Promise((resolve, reject) => {
    let JSESSIONID = wx.getStorageSync('JSESSIONID');
    // console.log('request JSESSIONID---', JSESSIONID);
    // console.log('request param---', param);
    wx.request({
      url: rootUrl + relativeUrl,
      method: method,
      header: { 
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'JSESSIONID=' + JSESSIONID
         },
      data: param || {},
      success(res) {
        // console.log('request success---', res);
        resolve(res);
      },
      fail(data) {
        console.log('request fail---', data);
        reject(data);
      },
      complete() {
        
      }
    });
  });
}
