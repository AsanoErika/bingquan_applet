//index.js
//获取应用实例
const app = getApp()

import Toast from '../../vant_dist/toast/toast';

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    sloganUrl: '../../img/slogan.png'
  },

  // 事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  goToShelf: function () {
    wx.switchTab({
      url: '/pages/shelf/index',
    })
  },
  goToShelf1: function () {
    wx.switchTab({
      url: '/pages/shelf1/index',
    })
  },

  // 扫描进入货柜
  scanShelf: function () {
    wx.scanCode({
      scanType: ['qrCode'],
      success: (res) => {
        var url = res.result
        var strs = url.split("=")
        // 判断是否正确二维码
        if (strs[0].search("bingquannet") != -1) {
          app.globalData.shelves_id = strs[1]
        }
        else {
          console.log("请扫描正确的货柜二维码")
          Toast('请扫描正确的货柜二维码')
        }
        if (app.globalData.shelves_id) {
          wx.switchTab({
            url: '/pages/shelf1/index',
          })
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
    else {
      console.log("拒绝")
      wx.navigateBack({
        delta: -1
      })
    }

  }
})
