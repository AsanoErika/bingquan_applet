// pages/balance/index.js

//获取应用实例
const app = getApp()
// toast
import Toast from '../../vant_dist/toast/toast'
// 时间
var util = require('../../utils/util.js')
// 加密算法
var RSA = require('../../utils/wxapp_rsa.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAgree: true,
    radio: "1",
    balance: null,
    rechargeChoice: [
      { "rechargeAmount": 0.01 },
      { "rechargeAmount": 20 },
      { "rechargeAmount": 50 },
      { "rechargeAmount": 100 },
      { "rechargeAmount": 200 },
      { "rechargeAmount": 300 },
      { "rechargeAmount": 500 },
    ],
    amountSelected: 20,
    order_id: null
  },

  // 同意相关条款
  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  },

  // 选择充值数额
  selectIndex: function (e) {
    this.setData({
      amountSelected: e.currentTarget.dataset.amount
    })
  },

  // 生成充值订单
  recharge: function () {
    if (this.data.isAgree) {
      var that = this
      Toast.loading({
        mask: true,
        message: '生成中...',
        duration: 0
      });
      wx.request({
        url: app.url + 'Appletshop/charge_money',
        data: {
          "user_id": app.globalData.user_id,
          "token": app.globalData.token,
          "money": that.data.amountSelected
        },
        method: 'POST',
        success: function (res) {
          if (res.data.status == 200) {
            Toast.success("订单已生成")
            that.setData({
              order_id: res.data.data.order_id
            })
            that.wechatPay()
          }
          else {
            Toast.fail(res.data.message)
          }
        },
        fail: function () {
          Toast.fail("error")
        }
      })
    }
    else {
      Toast.fail("请先阅读并同意《充值协议》")
    }

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
        // 充值订单
        "order_type": 2,
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
                Toast.success("充值成功")
                that.updateUserInfo()
              },
              'fail': function (res) {
                Toast.fail(res.errMsg)
              },
              'complete': function (res) {
              }
            })
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
          that.setData({
            balance: app.globalData.bingquan_userInfo.applet_money
          })

          console.log(app.globalData)
          Toast.success("更新成功")
        }
        else {
          Toast.fail(res.data.message)
        }

      },
      fail: function (res) { Toast.fail('失败') },
      complete: function (res) { },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      balance: app.globalData.bingquan_userInfo.applet_money
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

  }
})