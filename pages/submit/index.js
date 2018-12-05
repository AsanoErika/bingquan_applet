// pages/submit/index.js

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
    list: [],
    order_json: [],
    receive_coupon_id: 0,
    total_amount: 0,
    final_amount: 0,
    discount_amount: 0,
    discountShow: "去选择",
    popup: false,
    myCoupons: [],
    discount_list: [],
    password: null,
    order_id: null
  },

  // 优惠券弹出层
  handleClose() {
    this.setData({
      popup: false
    })
  },
  handleClick() {
    this.setData({
      popup: true
    })
  },

  // 支付方式选择
  onClick: function (e) {
    var radio = e.currentTarget.dataset.name
    this.setData({
      radio: radio
    })
  },

  // 优惠券信息
  getCouponsInfo: function () {

    var that = this
    // 我的优惠券
    wx.request({
      url: app.url + 'Appletshop/my_couponlist',
      data: {
        user_id: app.globalData.user_id,
        token: app.globalData.token
      },
      method: 'GET',
      success: function (res) {
        if (res.data.status == 200) {
          var myCoupons = res.data.data.not_uses
          var discount_list = []
          for (var i = 0; i < myCoupons.length; i++) {
            // 时间修改
            var start_date = new Date(myCoupons[i].start_time * 1000)
            var start_time = util.formatDate(start_date)
            myCoupons[i].start_time = start_time
            var end_date = new Date(myCoupons[i].end_time * 1000)
            var end_time = util.formatDate(end_date)
            myCoupons[i].end_time = end_time

            // 折扣计算
            var discount_val = 0
            // 满减
            if (myCoupons[i].type_id == 1) {
              if (that.data.total_amount >= parseFloat(myCoupons[i].full_money)) {
                discount_val = myCoupons[i].money
              }
              else {
                discount_val = 0
              }
            }
            // 打折
            else if (myCoupons[i].type_id == 2) {
              discount_val = that.data.total_amount * (1 - myCoupons[i].discount / 100)
            }
            // 无门槛
            else if (myCoupons[i].type_id == 3) {
              if (parseFloat(myCoupons[i].money) > that.data.total_amount) {
                discount_val = that.data.total_amount
              }
              else {
                discount_val = myCoupons[i].money
              }
            }
            // 存入
            discount_val = parseFloat(discount_val)
            discount_val = discount_val.toFixed(2)
            discount_list.push({ "id": myCoupons[i].id, "amount": discount_val })

          }

          that.setData({
            myCoupons: myCoupons,
            discount_list: discount_list
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

  // 选择优惠券
  selectCoupon: function (e) {
    var cindex = e.currentTarget.dataset.cindex
    var myCoupons = this.data.myCoupons
    for (var i = 0; i < myCoupons.length; i++) {
      myCoupons[i].selected = false
    }
    myCoupons[cindex].selected = true

    var receive_coupon_id = myCoupons[cindex].selected
    var final_amount = this.data.total_amount - this.data.discount_list[cindex].amount
    final_amount = final_amount.toFixed(2)
    this.setData({
      myCoupons: myCoupons,
      receive_coupon_id: myCoupons[cindex].id,
      discountShow: myCoupons[cindex].name,
      discount_amount: this.data.discount_list[cindex].amount,
      final_amount: final_amount
    })

    this.setData({
      popup: false
    })
  },

  // 结算
  goPay: function () {

    var that = this
    // 加载开启
    Toast.loading({
      mask: true,
      message: '提交中...',
      duration: 0
    });
    wx.request({
      url: app.url + 'Appletshop/generate_order',
      data: {
        user_id: app.globalData.user_id,
        token: app.globalData.token,
        shelves_id: app.globalData.shelves_id,
        order_json: this.data.order_json,
        receive_coupon_id: this.data.receive_coupon_id,
        total_amount: this.data.total_amount,
        final_amount: this.data.final_amount
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

          // 无需支付
          if (res.data.data.order_pay == 0) {
            // 支付成功跳转到货架页面
            that.closeGoShelf()
          }
          // 需要支付
          else {
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
                // Toast.fail(res.data.message)
                // 支付失败跳转到我的页面
                that.closeGoMy()
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
          that.closeGoShelf()
        }
        else {
          // 支付失败跳转到我的页面
          that.closeGoMy()
        }
      },
      fail: function () {
        // 支付失败跳转到我的页面
        that.closeGoMy()
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
                that.closeGoShelf()
              },
              'fail': function (res) {
                // 支付失败跳转到我的页面
                that.closeGoMy()
              }
            })
        }
        else {
          // 支付失败跳转到我的页面
          that.closeGoMy()
        }
      },
      fail: function () {
        // 支付失败跳转到我的页面
        that.closeGoMy()
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      list: app.globalData.order_list
    })
    for (var i = 0; i < this.data.list.length; i++) {
      this.data.total_amount = this.data.total_amount + this.data.list[i].shop_price * this.data.list[i].count
      this.data.order_json.push({ "id": this.data.list[i].goods_id, "goods_number": this.data.list[i].count })
    }
    this.setData({
      total_amount: this.data.total_amount.toFixed(2),
      final_amount: this.data.total_amount.toFixed(2)
    })

    this.getCouponsInfo()

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

  // 付款成功跳转到货架
  closeGoShelf: function () {
    app.globalData.currentIndex = 0
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
          url: '../shelf1/index'
        })
      }
    }, 1000);
  },

  // 付款失败跳转到我的
  closeGoMy: function () {
    Toast.loading({
      mask: true,
      duration: 0,
      forbidClick: true,
      message: '付款失败',
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