// pages/search/index.js
const app = getApp()
import Toast from '../../vant_dist/toast/toast'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchContent: null,
    searchResult: []
  },

  onSearch: function (e) {
    this.setData({
      searchContent: e.detail
    })
    var that = this

    // 加载动画
    this.setData({
      spinShow: true,
    })

    wx.request({
      url: app.url + 'Appletshop/index',
      data: {
        shelves_id: app.globalData.shelves_id,
        search_content: that.data.searchContent
      },
      method: 'GET',
      success: function (res) {
        if (res.data.status == 200) {
          that.setData({
            searchResult: res.data.data
          })
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

  changeCat: function (e) {
    for (var i = 0; i < app.globalData.tabIndex.length; i++) {
      if (app.globalData.tabIndex[i].typeId == e.currentTarget.dataset.typeid) {
        app.globalData.currentIndex = i
      }
    }
    wx.navigateBack({
      delta: 1
    })
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