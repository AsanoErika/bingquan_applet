// pages/repay/index.js

//获取应用实例
const app = getApp()
// toast
import Toast from '../../vant_dist/toast/toast'
// 时间
var util = require('../../utils/util.js')
// 安全码输入
import { $wuxKeyBoard } from '../../wux_dist/index'
// 日期选择
import { $wuxCalendar } from '../../wux_dist/index'
// 加密算法
var RSA = require('../../utils/wxapp_rsa.js')

// const now = new Date();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 付款方式
    radio: "1",

    // 货柜
    options: [],

    // 时间
    timePicked: '请选择日期',
    currentDate: new Date().getTime(),
    minDate: new Date(2018, 8, 1).getTime(),
    maxDate: new Date().getTime(),
    tpPopup: false,

    // 所需参数
    shelves_id: 0,
    money: 0
  },

  // 支付方式选择
  onClick: function (e) {
    var radio = e.currentTarget.dataset.name
    this.setData({
      radio: radio
    })
  },

  // 货柜选择
  confirmShelf: function (e) {
    this.setData({
      shelves_id: 10000
    })
    this.setData({
      shelves_id: e.detail.value[0]
    })
  },

  // 时间选择
  handleClose() {
    this.setData({
      tpPopup: false,
    });
  },
  openTimePicker: function () {
    this.setData({
      tpPopup: true,
    })
  },
  onConfirm(e) {
    var date = new Date(e.detail)
    var datePicked = util.formatDate(date)
    this.setData({
      timePicked: datePicked,
      tpPopup: false,
    })
  },
  onCancel(e) {
    this.setData({
      tpPopup: false,
    })
  },

  // 获取货柜
  getShelvesList: function () {
    var that = this
    wx.request({
      url: app.url + 'Appletshop/extra_shelveslist',
      data: {
        user_id: app.globalData.user_id,
        token: app.globalData.token,
      },
      method: 'GET',
      success: function (res) {
        if (res.data.status == 200) {
          var data = res.data.data
          var shelves = []
          for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].shelves.length; j++) {
              shelves.push({ key: data[i].shelves[j].name + ' ' + data[i].district_info.name, value: data[i].shelves[j].id })
            }
          }
          shelves.push({ key: '忘记货柜', value: 10000 })
          var options = [shelves]
          that.setData({
            options: options,
          })
        }
        else {
          Toast.fail(res.data.message)
        }
      },
      fail: function () {
        Toast.fail('失败')
      }
    })
  },

  // 补款金额
  iChange(e) {
    this.setData({
      money: e.detail.value
    })
  },

  // 补款
  repay: function () {
    var money = (this.data.money * 100 / 100).toFixed(2)
    var that = this
    // 加载开启
    Toast.loading({
      mask: true,
      message: '提交中...',
      duration: 0
    });
    wx.request({
      url: app.url + 'Appletshop/extra_money',
      data: {
        user_id: app.globalData.user_id,
        token: app.globalData.token,
        shelves_id: that.data.shelves_id,
        extra_date: that.data.timePicked,
        money: money
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.status == 200) {
          console.log(res)
          Toast.success("订单已生成")
          that.setData({
            order_id: res.data.data.order_id
          })

          // 微信支付
          if (that.data.radio == 1) {
            that.wechatPay()
          }
          // 余额支付
          else if (that.data.radio == 2) {
            // 已设置安全码
            if (app.globalData.bingquan_userInfo.pay_status == 1) {
              that.open()
            }
            // 未设置安全码
            else {
              that.setCode()
            }
          }
          else {
            Toast.fail("请先选择支付方式")
          }

        }
        else {
          Toast.fail(res.data.message)
        }
      },
      fail: function () {
        Toast.fail("error")
      }
    })

  },

  // 安全码键盘（余额支付）
  open() {
    var that = this
    $wuxKeyBoard().show({
      callback(value) {
        that.setData({
          password: value
        })
        that.verifyPass()
        return true
      },
    })
  },

  // 验证支付密码
  verifyPass: function () {
    var that = this
    Toast.loading({
      mask: true,
      message: '验证中...',
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
            url: app.url + 'safe/checkPayCode',
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
                that.balancePay()
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
    })
  },

  // 余额支付
  balancePay: function () {
    var that = this
    Toast.loading({
      mask: true,
      message: '支付中...',
      duration: 0
    });
    wx.request({
      url: app.url + 'Appletshop/pay_order',
      data: {
        "user_id": app.globalData.user_id,
        "token": app.globalData.token,
        "order_id": that.data.order_id,
        // 补款订单
        "order_type": 3,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.status == 200) {
          // 支付成功跳转到货架页面
          that.successPay()
        }
        else {
          // 支付失败跳转到我的页面
          that.failPay()
        }
      },
      fail: function () {
        // 支付失败跳转到我的页面
        that.failPay()
      }
    })
  },

  // 微信支付
  wechatPay: function () {
    var that = this
    Toast.loading({
      mask: true,
      message: '支付中...',
      duration: 0
    });
    wx.request({
      url: app.url + 'paywap/small_program_pay',
      data: {
        "user_id": app.globalData.user_id,
        "token": app.globalData.token,
        "order_id": that.data.order_id,
        // 补款订单
        "order_type": 3,
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 200) {
          // 微信支付接口调用
          wx.requestPayment(
            {
              'timeStamp': res.data.data.timeStamp,
              'nonceStr': res.data.data.nonceStr,
              'package': res.data.data.package,
              'signType': res.data.data.signType,
              'paySign': res.data.data.paySign,
              'success': function (res) {
                // 支付成功跳转到货架页面
                that.successPay()
              },
              'fail': function (res) {
                // 支付失败跳转到我的页面
                that.failPay()
              }
            })
        }
        else {
          // 支付失败跳转到我的页面
          that.failPay()
        }
      },
      fail: function () {
        // 支付失败跳转到我的页面
        that.failPay()
      }
    })
  },

  // 未设置安全码
  setCode: function () {
    Toast.loading({
      mask: true,
      duration: 0,
      forbidClick: true,
      message: '跳转至安全码设置',
      loadingType: 'spinner',
    })
    let second = 1;
    const timer = setInterval(() => {
      second--;
      if (second) {

      } else {
        clearInterval(timer);
        Toast.clear();
        wx.navigateTo({
          url: '../settings/password'
        })
      }
    }, 1000);
  },

  // 付款成功
  successPay: function () {
    Toast.loading({
      mask: true,
      duration: 0,
      forbidClick: true,
      message: '付款成功',
      loadingType: 'spinner',
    })
    let second = 1;
    const timer = setInterval(() => {
      second--;
      if (second) {

      } else {
        clearInterval(timer);
        Toast.clear();
        wx.reLaunch({
          url: '../my/index'
        })
      }
    }, 1000);
  },

  // 付款失败
  failPay: function () {
    Toast.fail("付款失败")
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getShelvesList()
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

  }
})