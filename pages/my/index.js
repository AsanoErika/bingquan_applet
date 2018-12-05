// pages/my/index.js
import Toast from '../../vant_dist/toast/toast'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: { "applet_money": 0, "avatar": "../../img/user.png", "id": null, "mobile": "还未绑定手机号", "mobile_bind": 1, "nickname": "匿名用户", "sex": 1, "sex_name": "男" }

  },

  // 更新用户信息
  updateUserInfo: function () {
    var that = this
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
            userInfo: app.globalData.bingquan_userInfo,
          })

        }
        else {

        }

      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  // 打电话
  phoneCall: function () {
    wx.makePhoneCall({
      phoneNumber: '010-63727882'
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
    // 未登录
    if (!app.globalData.token) {
      wx.navigateTo({
        url: '../login/index'
      })
    }
    // 已登录
    else {
      this.updateUserInfo()
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

  },

  // 联系客服
  onContact: function (e) {
    console.log('onContact', e)
  }
})