// pages/shelf/index.js

import Toast from '../../vant_dist/toast/toast';
//获取应用实例
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    spinShow: false,
    show: false,
    popupshow: false,
    categories: [{ name: "饮品" }, { name: "饼干" }, { name: "卤味" }, { name: "膨化" }, { name: "速食" }, { name: "面包" }, { name: "其他" }],
    goodslist: [],
    cartlist: [],
    totalcount: 0,
    totalprice: 0,
    scanInfo: {}
  },

  // 进入搜索页面
  searchGoods: function () {
    wx.navigateTo({
      url: '../search/index'
    })
  },

  // 扫码
  scanCode: function () {
    wx.scanCode({
      scanType: [],
      success: (res) => {
        var scanflag = 0
        for (var i = 0; i < this.data.goodslist.length; i++) {
          if (res.result == this.data.goodslist[i].bar_code) {
            scanflag = 1
            if (this.data.goodslist[i].count < this.data.goodslist[i].current_qty) {
              this.data.goodslist[i].count = this.data.goodslist[i].count + 1
            }
            else {
              Toast.fail("超出库存限制")
            }
          }
        }

        if (scanflag == 0) {
          Toast.fail("没有货品")
        }
        else {
          this.calShow()
        }

      }
    })
  },

  // 增减货品
  onChange: function (e) {
    for (var i = 0; i < this.data.goodslist.length; i++) {
      if (e.currentTarget.dataset.id == this.data.goodslist[i].id) {
        this.data.goodslist[i].count = e.detail
      }
    }
    this.calShow()
  },

  // 数量总价与页面变化等
  calShow() {
    // 数量与总价
    var totalcount = 0
    var totalprice = 0
    for (var i = 0; i < this.data.goodslist.length; i++) {
      if (this.data.goodslist[i].count > 0) {
        totalcount = totalcount + this.data.goodslist[i].count
        totalprice = totalprice + this.data.goodslist[i].shop_price * this.data.goodslist[i].count
      }
    }
    this.setData({
      totalcount: totalcount,
      totalprice: totalprice * 100
    })
    this.setData({
      goodslist: this.data.goodslist
    })

    // 购物车显示
    if (this.data.totalcount == 0) {
      this.setData({
        show: false,
      })
    }
    else {
      this.setData({
        show: true,
      })
    }
  },

  showList() {
    this.setData({ popupshow: !this.data.popupshow });
  },

  onClose() {
    this.setData({ popupshow: false });
  },

  // 生成订单列表并进入结算页面
  goSubmit() {
    if (!app.globalData.token) {
      Toast.fail("请先登录")
      wx.navigateTo({
        url: '../login/index'
      })
    }
    else {
      var order_list = []
      for (var i = 0; i < this.data.goodslist.length; i++) {
        if (this.data.goodslist[i].count > 0) {
          order_list.push(this.data.goodslist[i])
        }
      }
      app.globalData.order_list = order_list
      wx.navigateTo({
        url: '../submit/index'
      })
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this

    // 加载动画
    this.setData({
      spinShow: true,
    })

    wx.request({
      url: app.url + 'Appletshop/index',
      data: {
        shelves_id: 1
      },
      method: 'GET',
      success: function (res) {
        if (res.data.status == 200) {
          var categories = [];
          var goodslist = [];
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
            if (res.data.data[i].stocks) {
              for (var j = 0; j < res.data.data[i].stocks.length; j++) {
                goodslist.push(res.data.data[i].stocks[j])
              }
            }
          }
          that.setData({
            categories: categories,
            goodslist: goodslist
          });
        }
        else {
          Toast.fail(res.data.message)
        }
      },
      fail: function () {
        Toast.fail("error")
      },
      complete: function () {
        // 加载动画关闭
        that.setData({
          spinShow: false
        })
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

  }
})