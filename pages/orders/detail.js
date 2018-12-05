// pages/orders/detail.js

//获取应用实例
const app = getApp()
// toast
import Toast from '../../vant_dist/toast/toast'
// 时间
var util = require('../../utils/util.js')
// 安全码输入
import { $wuxKeyBoard } from '../../wux_dist/index'
// 加密算法
var RSA = require('../../utils/wxapp_rsa.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    radio: "1",
    order_id: 0,
    orderDetail: {},
    orderStatus: '获取中',
    orderIcon: 'ios-time',
    countShow: false,

    targetTime: 0,
    clearTimer: false
  },

  // 支付方式选择
  onClick: function (e) {
    var radio = e.currentTarget.dataset.name
    this.setData({
      radio: radio
    })
  },

  // 订单信息
  getOrderDetail: function (order_id) {
    // 加载动画
    this.setData({
      spinShow: true,
    })

    var that = this
    wx.request({
      url: app.url + 'Appletshop/order_details',
      data: {
        user_id: app.globalData.user_id,
        token: app.globalData.token,
        order_id: order_id
      },
      method: 'POST',
      success: function (res) {
        console.log(res)
        if (res.data.status == 200) {
          that.setData({
            orderDetail: res.data.data
          })
          if (res.data.data.order_info.order_status == -2) {
            that.setData({
              orderStatus: '已超时',
              orderIcon: 'ios-close-circle',
              countShow: false,
            })
          }
          else if (res.data.data.order_info.order_status == -1) {
            that.setData({
              orderStatus: '已取消',
              orderIcon: 'ios-close-circle',
              countShow: false,
            })
          }
          else if (res.data.data.order_info.order_status == 0) {
            that.setData({
              orderStatus: '待支付',
              orderIcon: 'ios-alert',
              countShow: true,
              targetTime: res.data.data.order_info.pay_overtime * 1000
            })
          }
          else if (res.data.data.order_info.order_status == 1) {
            that.setData({
              orderStatus: '已完成',
              orderIcon: 'ios-checkmark-circle',
              countShow: false,
            })
          }
        }
        else {
          Toast.fail(res.data.message)
        }
      },
      fail: function () {
        Toast.fail('失败')
      },
      complete: function () {
        // 加载动画关闭
        that.setData({
          spinShow: false
        })
      }
    })
  },

  // 结算
  goPay: function () {
    var that = this
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
        // 商品支付订单
        "order_type": 1,
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
        // 商品支付订单
        "order_type": 1,
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
    Toast.success("付款成功")
    this.getOrderDetail(this.data.order_id)
  },

  // 付款失败
  failPay: function () {
    Toast.fail("付款失败")
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      order_id: options.order_id,
    })
    this.getOrderDetail(this.data.order_id)
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
    this.setData({
      clearTimer: true
    });
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