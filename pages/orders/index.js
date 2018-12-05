// pages/orders/index.js

import Toast from '../../vant_dist/toast/toast';
const app = getApp()
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow: false,
    currentPage: 1,
    orderList: []
  },

  // 获取订单列表
  getOrderList: function (pageid) {
    // 加载动画
    this.setData({
      spinShow: true,
    })

    var that = this
    wx.request({
      url: app.url + 'Appletshop/order_list',
      data: {
        user_id: app.globalData.user_id,
        token: app.globalData.token,
        page: pageid,
        limit: 5
      },
      method: 'GET',
      success: function (res) {
        if (res.data.status == 200) {
          console.log(res)
          var orderList = that.data.orderList
          for (var i = 0; i < res.data.data.length; i++) {
            orderList.push(res.data.data[i])
            var date = new Date(res.data.data[i].add_time * 1000)
            var time = util.formatTime(date)
            orderList[i].add_time = time
          }
          that.setData({
            orderList: orderList
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
  },

  // 打开订单详情
  gotoDetail: function (e) {
    var order_id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../orders/detail?order_id=' + order_id
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderList(this.data.currentPage)
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
    this.setData({
      orderList: [],
      currentPage: 1
    })
    wx.stopPullDownRefresh() //停止下拉刷新

    this.getOrderList(this.data.currentPage)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      currentPage: this.data.currentPage + 1
    })

    this.getOrderList(this.data.currentPage)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})