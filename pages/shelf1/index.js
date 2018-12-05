// pages/shelf1/index.js

import Toast from '../../vant_dist/toast/toast';
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0,
    tabs: [{
      text: '饮品',
    },
    {
      text: '饼干',
    },
    {
      text: '卤味',
    },
    {
      text: '膨化',
    },
    {
      text: '速食',
    },
    {
      text: '面包',
    },
    {
      text: '其他',
    },],
    options: [],
    pageHeight: 0,

    spinShow: false,
    show: false,
    popupshow: false,
    categories: [],
    goodslist: [],
    cartlist: [],
    totalcount: 0,
    totalprice: 0,
    scanInfo: {},

    // 滚动通知
    noticeShow: false,
    noticeContent: "恭喜匿名用户获得5元无门槛优惠券一张",

    // 弹出广告
    adShow: false,
    adImg: '',
    adUrl: ''
  },

  // 滚动通知
  showNotice: function () {
    var that = this
    wx.request({
      url: app.url + 'Appletshop/roll_msg',
      data: {
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 200) {
          if (res.data.data.show_status == 1) {
            that.setData({
              noticeContent: res.data.data.title,
              noticeShow: true,
            })
          }
        }
      },
      fail: function () {
      },
    })
  },

  // 弹出广告
  showAd: function () {
    if (!app.globalData.if_showad) {
      var that = this
      wx.request({
        url: app.url + 'appletuser/propaganda',
        data: {
        },
        method: 'POST',
        success: function (res) {
          if (res.data.status == 200) {
            if (res.data.data.status == 1) {
              that.setData({
                adImg: res.data.data.img_url,
                adUrl: res.data.data.url,
                adShow: true,
              })
              app.globalData.if_showad = true
            }
          }
        },
        fail: function () {
        },
      })
    }
  },
  closeAd: function () {
    this.setData({
      adShow: false,
    })
  },

  // 点击广告进入领取优惠页面
  gotoActivity: function () {
    this.setData({
      adShow: false,
    })
    wx.navigateTo({
      url: '../coupons/index',
    })
  },

  // tab滚动
  handleScrollableChange(e) {
    this.setData({
      currentIndex: e.detail.value,
    })
    app.globalData.currentIndex = e.detail.value
  },
  handleChange(e) {
    this.setData({
      currentIndex: e.detail.value,
    })
    app.globalData.currentIndex = e.detail.value
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
      scanType: ['barCode'],
      success: (res) => {
        var scanflag = 0
        for (var i = 0; i < this.data.goodslist.length; i++) {
          if (res.result == this.data.goodslist[i].bar_code) {
            scanflag = 1
            if (this.data.goodslist[i].count < this.data.goodslist[i].current_qty) {
              this.data.goodslist[i].count = this.data.goodslist[i].count + 1
              Toast.success("已加入购物车")
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
      if (e.currentTarget.dataset.goods_id == this.data.goodslist[i].goods_id) {
        this.data.goodslist[i].count = e.detail
      }
    }
    this.calShow()
  },
  onBlur: function (e) {
    console.log(e)
  },

  // 无货提示
  onPlus: function (e) {
    if (e.currentTarget.dataset.max_qty == 0) {
      Toast.fail("暂时无货")
    }
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
        popupshow: false
      })
    }
    else {
      this.setData({
        show: true,
      })
    }
  },

  // 购物车内容显示
  showList() {
    this.setData({
      popupshow: !this.data.popupshow
    });
  },
  onClose() {
    this.setData({
      popupshow: false
    });
  },

  // 清空购物车
  clearCart() {
    var goodslist = this.data.goodslist
    for (var i = 0; i < goodslist.length; i++) {
      if (goodslist[i].count > 0) {
        goodslist[i].count = 0
      }
    }
    this.setData({
      show: false,
      goodslist: goodslist,
      popupshow: false
    });
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
    this.showAd()

    var url = decodeURIComponent(options.q)
    if (url.search("bingquannet") != -1) {
      var strs = url.split("=")
      app.globalData.shelves_id = strs[1]
    }

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

    var that = this

    // 加载动画
    this.setData({
      spinShow: true,
    })

    wx.request({
      url: app.url + 'Appletshop/index',
      data: {
        shelves_id: app.globalData.shelves_id
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
          var tabs = []
          var options = []
          var tabIndex = []
          for (var k = 0; k < categories.length; k++) {
            tabs.push({ "text": categories[k].name })
            options.push({ "containerName": categories[k].name })
            tabIndex.push({ "typeId": categories[k].id })
          }

          // 全局tab搜索用
          app.globalData.tabIndex = tabIndex

          that.setData({
            tabs: tabs,
            options: options,
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
    this.setData({
      currentIndex: app.globalData.currentIndex
    })
    this.showNotice()
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