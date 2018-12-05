// pages/login/index.js
import { $wuxCountDown } from '../../wux_dist/index'
import Toast from '../../vant_dist/toast/toast';
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAgree: true,
    phoneNum: '',
    smsCode: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = res.code
        app.globalData.code = code

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  },
  vcode() {
    if (this.c2 && this.c2.interval) return !1
    this.c2 = new $wuxCountDown({
      date: +(new Date) + 60000,
      onEnd() {
        this.setData({
          c2: '重新获取验证码',
        })
      },
      render(date) {
        const sec = this.leadingZeros(date.sec, 2) + ' 秒 '
        date.sec !== 0 && this.setData({
          c2: sec,
        })
      },
    })
  },
  getUserInfo: function (e) {
    var that = this
    var phoneNum = this.data.phoneNum
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      app.globalData.encryptedData = e.detail.encryptedData
      app.globalData.iv = e.detail.iv

      // 加载开启
      Toast.loading({
        mask: true,
        message: '获取中...',
        duration: 0
      });
      wx.request({
        url: app.url + 'user/mobile_login',
        data: {
          mobile: phoneNum
        },
        method: 'GET',
        success: function (res) {
          if (res.data.status == 200) {
            // 加载关闭
            Toast.clear();
            that.vcode()           
          }
          else {
            Toast.fail(res.data.message)
          }
        },
        fail: function () {
          Toast.fail('失败')
        },
        complete: function () {

        }
      })
    }
    else {
      Toast.fail('请允许')
    }

  },
  bindPhoneInput: function (e) {
    this.setData({
      phoneNum: e.detail.value
    })
  },
  bindSmsCode: function (e) {
    this.setData({
      smsCode: e.detail.value
    })
  },
  getLoginInfo: function () {
    var mobile = this.data.phoneNum
    var sms_code = this.data.smsCode
    var code = app.globalData.code
    var encryptedData = app.globalData.encryptedData
    var iv = app.globalData.iv
    if (encryptedData) {

      Toast.loading({
        mask: true,
        message: '登录中...',
        duration: 0
      });

      wx.request({
        url: app.url + 'appletuser/login',
        data: {
          shelves_id: app.globalData.shelves_id,
          mobile: mobile,
          sms_code: sms_code,
          code: code,
          encryptedData: encryptedData,
          iv: iv
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.data.status == 200) {
            console.log(res)
            app.globalData.bingquan_userInfo = res.data.data
            app.globalData.user_id = res.data.data.id
            app.globalData.token = res.data.data.token
            wx.navigateBack({
              delta: 1
            })
          }
          else {
            Toast.fail(res.data.message)
          }
        },
        fail: function () {
          Toast.fail('失败')
        },
        complete: function () {
        }
      })

    }
    else {
      Toast.fail('请获取验证码')
    }

  }
})