// pages/settings/password.js

import { $wuxCountDown } from '../../wux_dist/index'
import Toast from '../../vant_dist/toast/toast'
const app = getApp()
// 安全码输入
import { $wuxKeyBoard } from '../../wux_dist/index'
// 加密算法
var RSA = require('../../utils/wxapp_rsa.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAgree: true,
    passStatus: 0,
    passShow: '',
    btnShow: '',
    mobile: '',
    code: null,
    password: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.setData({
      mobile: app.globalData.bingquan_userInfo.mobile
    })
    if (app.globalData.bingquan_userInfo.pay_status == 0) {
      this.setData({
        passStatus: 0,
        passShow: "密码未设置",
        btnShow: "设置密码"
      })
    }
    else if (app.globalData.bingquan_userInfo.pay_status == 1) {
      this.setData({
        passStatus: 1,
        passShow: "密码已设置",
        btnShow: "修改密码"
      })
    }
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

  // 安全码键盘
  open() {
    var that = this
    $wuxKeyBoard().show({
      callback(value) {
        that.setData({
          password: value
        })
        that.setPassword()
        return true
      },
    })
  },

  // 设置安全码
  setPassword: function () {
    var that = this
    Toast.loading({
      mask: true,
      message: '设置中...',
      duration: 0
    });
    var stamp = 0

    // 获取时间戳
    wx.request({
      url: app.url + 'Appletshop/now_time',
      data: {},
      method: 'GET',
      success: function (res) {

        if (res.statusCode == 200) {
          stamp = res.data.now_time
          var code_rsa = String(stamp) + String(that.data.password)

          var publicKey_pkcs1 = '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCq44+yDSdhzVHLG6OoeskN5rmvlmSfn/uVMEGslQhjan10njkKVJlPFjJB4HasMQijJD8lbkzS/KG5QJhWhlH8Uhmh/iUui4to5TIbkQVIcYj5dmDuRB0/lNN0qofGGot++UaO1rHKXUTbDuN3Ms2tia0fTnevj7EWFlYcsSXL6wIDAQAB-----END PUBLIC KEY-----'
          var encrypt_rsa = new RSA.RSAKey();
          encrypt_rsa = RSA.KEYUTIL.getKey(publicKey_pkcs1);
          var encStr = encrypt_rsa.encrypt(code_rsa)
          encStr = RSA.hex2b64(encStr);

          wx.request({
            url: app.url + 'safe/setPayCode',
            data: {
              "user_id": app.globalData.user_id,
              "token": app.globalData.token,
              "code": encStr,
              "module": 1

            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              if (res.data.status == 200) {
                // 加载关闭
                Toast.clear();
                Toast.success("设置成功");
                that.updateUserInfo()

              }
              else {
                Toast.fail(res.data.message)
              }
            },
            fail: function () {
              Toast.fail('失败')
            }
          })
        }
        else {
          Toast.fail('获取时间戳失败')
        }


      },
      fail: function () {
        Toast.fail('获取时间戳失败')
      },
      complete: function () {
      }
    })

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

  getCode: function () {

    var that = this
    // 加载开启
    Toast.loading({
      mask: true,
      message: '获取中...',
      duration: 0
    });
    wx.request({
      url: app.url + 'user/sendSms',
      data: {
        "user_id": app.globalData.user_id,
        "token": app.globalData.token,
        "mobile": app.globalData.bingquan_userInfo.mobile,
        "type": "1"
      },
      method: 'GET',
      success: function (res) {
        if (res.data.status == 200) {
          that.vcode()
          // 加载关闭
          Toast.clear();
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
  },

  bindPhoneInput: function (e) {
  },

  bindSmsCode: function (e) {
    this.setData({
      code: e.detail.value
    })
  },

  verifyCode: function () {
    var code = this.data.code
    var that = this

    if (code) {

      Toast.loading({
        mask: true,
        message: '验证中...',
        duration: 0
      });

      wx.request({
        url: app.url + 'user/verification',
        data: {
          "user_id": app.globalData.user_id,
          "token": app.globalData.token,
          "mobile": app.globalData.bingquan_userInfo.mobile,
          "code": code,
          "type": "1"
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.data.status == 200) {
            // 加载关闭
            Toast.clear();
            that.open();
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

  },

  // 更新用户信息
  updateUserInfo: function () {
    var that = this
    Toast.loading({
      mask: true,
      message: '更新信息中...',
      duration: 0
    });
    wx.request({
      url: app.url + 'appletuser/userInfo',
      data: {
        user_id: app.globalData.user_id,
        token: app.globalData.token
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.status == 200) {
          app.globalData.bingquan_userInfo = res.data.user_info
          if (app.globalData.bingquan_userInfo.pay_status == 0) {
            that.setData({
              passStatus: 0,
              passShow: "密码未设置",
              btnShow: "设置密码"
            })
          }
          else if (app.globalData.bingquan_userInfo.pay_status == 1) {
            that.setData({
              passStatus: 1,
              passShow: "密码已设置",
              btnShow: "修改密码"
            })
          }
          console.log(app.globalData)
          that.closePage()
        }
        else {
          Toast.fail(res.data.message)
        }

      },
      fail: function (res) { Toast.fail('失败') },
      complete: function (res) { },
    })
  },

  // 更新成功关闭此页面
  closePage: function () {
    Toast.loading({
      mask: true,
      duration: 0,
      forbidClick: true,
      message: '更新成功',
      loadingType: 'spinner',
    })
    let second = 1;
    const timer = setInterval(() => {
      second--;
      if (second) {

      } else {
        clearInterval(timer);
        Toast.clear();
        wx.navigateBack({
          delta: 1
        })
      }
    }, 1000);
  },

})