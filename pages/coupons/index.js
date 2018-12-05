// pages/coupons/index.js
import Toast from '../../vant_dist/toast/toast';
const app = getApp()
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0,
    tabs: [
      {
        text: '可领取',
      },
      {
        text: '可使用',
      },
      {
        text: '已过期',
      }
    ],
    options: [
      {
        containerName: '可领取',
      },
      {
        containerName: '可使用',
      },
      {
        containerName: '已过期',
      }
    ],
    pageHeight: 0,

    unreceivedCoupons: [],
    myCoupons: [],
    expiredCoupons: []

  },
  handleScrollableChange(e) {
    this.setData({
      currentIndex: e.detail.value,
    })
  },
  handleChange(e) {
    this.setData({
      currentIndex: e.detail.value,
    })
  },

  getCouponsInfo: function () {

    // 加载动画
    this.setData({
      spinShow: true,
    })

    var that = this

    // 可领取优惠券
    wx.request({
      url: app.url + 'Appletshop/receive_couponlist',
      data: {
        user_id: app.globalData.user_id,
        token: app.globalData.token
      },
      method: 'GET',
      success: function (res) {
        if (res.data.status == 200) {
          var unreceivedCoupons = res.data.data
          for (var i = 0; i < unreceivedCoupons.length; i++) {
            var start_date = new Date(unreceivedCoupons[i].start_time * 1000)
            var start_time = util.formatDate(start_date)
            unreceivedCoupons[i].start_time = start_time
            var end_date = new Date(unreceivedCoupons[i].end_time * 1000)
            var end_time = util.formatDate(end_date)
            unreceivedCoupons[i].end_time = end_time
          }
          that.setData({
            unreceivedCoupons: unreceivedCoupons
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
        // 加载动画关闭
        that.setData({
          spinShow: false
        })
      }
    })

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
          for (var i = 0; i < myCoupons.length; i++) {
            var start_date = new Date(myCoupons[i].start_time * 1000)
            var start_time = util.formatDate(start_date)
            myCoupons[i].start_time = start_time
            var end_date = new Date(myCoupons[i].end_time * 1000)
            var end_time = util.formatDate(end_date)
            myCoupons[i].end_time = end_time
          }

          var expiredCoupons = res.data.data.expireds
          for (var i = 0; i < expiredCoupons.length; i++) {
            var start_date = new Date(expiredCoupons[i].start_time * 1000)
            var start_time = util.formatDate(start_date)
            expiredCoupons[i].start_time = start_time
            var end_date = new Date(expiredCoupons[i].end_time * 1000)
            var end_time = util.formatDate(end_date)
            expiredCoupons[i].end_time = end_time
          }

          that.setData({
            myCoupons: myCoupons,
            expiredCoupons: expiredCoupons
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

  // 领取优惠券
  getCoupon: function (e) {
    var coupon_id = e.currentTarget.dataset.id
    var that = this

    // 加载开启
    Toast.loading({
      mask: true,
      message: '领取中...',
      duration: 0
    });
    wx.request({
      url: app.url + 'Appletshop/receive_coupon',
      data: {
        user_id: app.globalData.user_id,
        token: app.globalData.token,
        coupon_id: coupon_id
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 200) {
          Toast.fail('领取成功')
          that.getCouponsInfo()
        }
        else {
          Toast.fail(res.data.message)
        }
      },
      fail: function () {
        Toast.fail('失败')
      },
      complete: function () {
        // 加载关闭
        Toast.clear();
      }
    })
  },

  gotoShelf: function() {
    wx.switchTab({
      url: '../shelf1/index'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.createSelectorQuery()
      .select('.w-scrollable-tab-view-bar')
      .boundingClientRect()
      .exec(([node]) => {
        // this.setData({
        //   pageHeight: wx.getSystemInfoSync().windowHeight - node.height,
        // })
        this.setData({
          pageHeight: wx.getSystemInfoSync().windowHeight
        })
      })

    // this.getCouponsInfo()
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
    // 未登录
    if (!app.globalData.token) {
      wx.navigateTo({
        url: '../login/index'
      })
    }
    else {
      this.getCouponsInfo()
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

  }
})